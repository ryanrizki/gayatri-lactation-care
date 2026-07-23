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
// absolute module count there). Assertions here are scoped to our own titles/ids.
const CLASS_SERVICE_ID = "kelas_bekerja";
const TEST_MODULE_PREFIX = "Modul Halaman E2E";
const TEST_EMAIL_DOMAIN = "@module-page-e2e.test";
const USER_PASSWORD = "RahasiaMama123";

const FIXTURE_MP4 = resolve(process.cwd(), "e2e/fixtures/sample.mp4");

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

const userEmail = `paid_${Date.now()}${TEST_EMAIL_DOMAIN}`;
let module1Id = "";
let module2Id = "";

async function registerUser(page: Page, email: string) {
  await page.goto("/daftar");
  await page.getByLabel(/nama/i).fill("Mama Halaman E2E");
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

  // Negative sortOrders guarantee our two modules are the FIRST two (and
  // adjacent) in the ordered list regardless of any other modules already
  // seeded into kelas_bekerja by other specs — so module 1 is genuinely
  // "Modul 1" (Prev disabled) and paging Next lands on module 2. Nothing else
  // in the app uses negative sortOrder (createModule/admin use count-based ≥ 0).

  // Module 1 (first in order) carries a video.
  const m1 = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} — Satu`,
      description: "Modul pertama dengan video.",
      sortOrder: -2,
      videoPath: copyFixture(FIXTURE_MP4, "videos", ".mp4"),
    },
  });
  module1Id = m1.id;

  // Module 2 (second in order).
  const m2 = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} — Dua`,
      description: "Modul kedua.",
      sortOrder: -1,
      videoPath: copyFixture(FIXTURE_MP4, "videos", ".mp4"),
    },
  });
  module2Id = m2.id;
});

test.afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test("PAID user: TOC lists modules, opens Modul 1, and pages to Modul 2", async ({
  page,
}) => {
  await registerUser(page, userEmail);
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: userEmail },
  });
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      serviceId: CLASS_SERVICE_ID,
      status: "PAID",
      confirmedAt: new Date(),
    },
  });

  // The class page is a TOC listing both seeded modules as links.
  await page.goto(`/kelas-saya/${CLASS_SERVICE_ID}`);
  await expect(page).toHaveURL(new RegExp(`/kelas-saya/${CLASS_SERVICE_ID}$`));
  const link1 = page.locator(
    `a[href="/kelas-saya/${CLASS_SERVICE_ID}/${module1Id}"]`,
  );
  const link2 = page.locator(
    `a[href="/kelas-saya/${CLASS_SERVICE_ID}/${module2Id}"]`,
  );
  await expect(link1).toBeVisible();
  await expect(link2).toBeVisible();

  // Open Modul 1 → its own page: video + "Modul 1 / N" header.
  await link1.click();
  await expect(page).toHaveURL(
    new RegExp(`/kelas-saya/${CLASS_SERVICE_ID}/${module1Id}$`),
  );
  await expect(page.locator("video").first()).toBeVisible();
  await expect(page.getByText(/Modul\s*1\s*\/\s*\d+/)).toBeVisible();

  // At the first module, "Modul sebelumnya" is a disabled button, "Modul
  // berikutnya" is an enabled link.
  await expect(
    page.getByRole("button", { name: /Modul sebelumnya/ }),
  ).toBeDisabled();
  const nextLink = page.getByRole("link", { name: /Modul berikutnya/ });
  await expect(nextLink).toBeVisible();

  // Paging forward lands on Modul 2.
  await nextLink.click();
  await expect(page).toHaveURL(
    new RegExp(`/kelas-saya/${CLASS_SERVICE_ID}/${module2Id}$`),
  );
  await expect(page.getByText(/Modul\s*2\s*\/\s*\d+/)).toBeVisible();

  // On module 2, "Modul sebelumnya" is now an enabled link back to module 1.
  await expect(
    page.getByRole("link", { name: /Modul sebelumnya/ }),
  ).toBeVisible();
});

test("anon direct-visit to a module page redirects to /masuk", async ({
  page,
}) => {
  await page.goto(`/kelas-saya/${CLASS_SERVICE_ID}/${module1Id}`);
  await page.waitForURL(/\/masuk/);
  expect(page.url()).toContain("/masuk");
});
