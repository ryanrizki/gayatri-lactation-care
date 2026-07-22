import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync, copyFileSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

// Parse .env at load (Playwright's runner does not load it; Next's server does).
// Mirrors e2e/kelas-saya.spec.ts. No secret is hardcoded here.
function loadDotenv(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      out[m[1]] = val;
    }
  } catch {
    // .env absent — rely on process.env.
  }
  return out;
}

const dotenv = loadDotenv();
const DATABASE_URL = process.env.DATABASE_URL || dotenv.DATABASE_URL;
const UPLOAD_DIR = process.env.UPLOAD_DIR || dotenv.UPLOAD_DIR || "./uploads";

// Seed into kelas_bekerja (NOT kelas_menyusui — admin-modul.spec asserts an
// absolute module count there). Assertions here are scoped to our own titles.
const CLASS_SERVICE_ID = "kelas_bekerja";
const TEST_MODULE_PREFIX = "Modul PDF E2E";
const MATERIAL_TITLE = "Materi Baca E2E";
const TEST_EMAIL_DOMAIN = "@pdf-reader-e2e.test";
const USER_PASSWORD = "RahasiaMama123";

// A 2-page fixture so "Berikutnya" has a page to advance to.
const FIXTURE_PDF_2 = resolve(process.cwd(), "e2e/fixtures/sample-2pages.pdf");

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

const userEmail = `paid_${Date.now()}${TEST_EMAIL_DOMAIN}`;
let materialId = "";

async function registerUser(page: Page, email: string) {
  await page.goto("/daftar");
  await page.getByLabel(/nama/i).fill("Mama PDF E2E");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(USER_PASSWORD);
  await page.getByRole("button", { name: /daftar/i }).click();
  await page.waitForURL("http://localhost:3000/");
}

function copyFixture(fixture: string, subdir: string, ext: string): string {
  const rel = `${subdir}/${randomUUID()}${ext}`;
  copyFileSync(fixture, resolve(process.cwd(), UPLOAD_DIR, rel));
  return rel;
}

async function unlinkUpload(relPath: string | null | undefined) {
  if (!relPath) return;
  await unlink(resolve(process.cwd(), UPLOAD_DIR, relPath)).catch(() => {});
}

async function cleanupTestData() {
  const mods = await prisma.module.findMany({
    where: { title: { startsWith: TEST_MODULE_PREFIX } },
    include: { materials: true },
  });
  for (const mod of mods) {
    await unlinkUpload(mod.videoPath);
    for (const mat of mod.materials) await unlinkUpload(mat.filePath);
  }
  await prisma.module.deleteMany({
    where: { title: { startsWith: TEST_MODULE_PREFIX } },
  });

  const users = await prisma.user.findMany({
    where: { email: { endsWith: TEST_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await prisma.enrollment.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
}

test.beforeAll(async () => {
  await cleanupTestData();
  const mod = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} — Modul`,
      description: "Modul dengan materi PDF untuk uji baca inline.",
      sortOrder: 1,
      materials: {
        create: {
          title: MATERIAL_TITLE,
          type: "PDF",
          filePath: copyFixture(FIXTURE_PDF_2, "materials", ".pdf"),
        },
      },
    },
    include: { materials: true },
  });
  materialId = mod.materials[0].id;
});

test.afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test("PAID user reads a PDF material inline and pages Next/Prev", async ({ page }) => {
  // Register + grant a PAID enrollment.
  await registerUser(page, userEmail);
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      serviceId: CLASS_SERVICE_ID,
      status: "PAID",
      confirmedAt: new Date(),
    },
  });

  await page.goto(`/kelas-saya/${CLASS_SERVICE_ID}`);
  await expect(page).toHaveURL(new RegExp(`/kelas-saya/${CLASS_SERVICE_ID}$`));

  // Scope to OUR material's row (the class may hold other PDF materials too).
  const row = page.getByRole("listitem").filter({ hasText: MATERIAL_TITLE });

  // The material starts as a row with a "Baca" button — NOT an inline viewer.
  const baca = row.getByRole("button", { name: "Baca" });
  await expect(baca).toBeVisible();
  await expect(row.locator("canvas")).toHaveCount(0);

  // Open the reader → first page renders (canvas) and the pager shows "Hal 1 / 2".
  await baca.click();
  await expect(row.locator("canvas")).toBeVisible({ timeout: 15000 });
  await expect(row.getByText(/Hal\s*1\s*\/\s*2/)).toBeVisible({ timeout: 15000 });

  // Previous is disabled on page 1.
  await expect(row.getByRole("button", { name: /Sebelumnya/ })).toBeDisabled();

  // Next advances to page 2.
  await row.getByRole("button", { name: /Berikutnya/ }).click();
  await expect(row.getByText(/Hal\s*2\s*\/\s*2/)).toBeVisible({ timeout: 15000 });

  // On the last page, Next is disabled and Previous is enabled.
  await expect(row.getByRole("button", { name: /Berikutnya/ })).toBeDisabled();
  await expect(row.getByRole("button", { name: /Sebelumnya/ })).toBeEnabled();

  // The gated PDF still serves 200 for the PAID buyer.
  const pdf = await page.request.get(`/api/material/${materialId}`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});
