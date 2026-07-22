import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Playwright's runner does not load .env (only Next's dev server does). We parse
// .env at module load to obtain the admin password and DB URL, falling back to
// any values already present in process.env. The password is NEVER hardcoded
// here — only the non-secret default admin email is referenced as a fallback.
// (Same pattern as e2e/admin.spec.ts.)
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
    // .env absent — rely on process.env below.
  }
  return out;
}

const dotenv = loadDotenv();
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || dotenv.ADMIN_EMAIL || "admin@gayatri.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || dotenv.ADMIN_PASSWORD;
const DATABASE_URL = process.env.DATABASE_URL || dotenv.DATABASE_URL;

// Seeded class service used for the module-builder flows.
const CLASS_SERVICE_ID = "kelas_menyusui";
// Seeded consultation service used for the "not a digital class" guard.
const CONSULT_SERVICE_ID = "laktasi_klinik";
// All test modules share this title prefix so teardown can match them cleanly.
const TEST_MODULE_PREFIX = "Modul Uji";

// Direct Prisma client for cleanup, wired to the resolved DATABASE_URL so it
// works even though the Playwright process never loaded .env.
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

// Log in through the real /masuk form. The header also renders a "Masuk" link,
// so the submit button is scoped to the form (button role vs. link role).
async function loginAsAdmin(page: Page) {
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
  await page.locator("form").getByRole("button", { name: "Masuk" }).click();
  // Login lands on /kelas-saya, then the (member) layout redirects an ADMIN to /admin.
  await page.waitForURL(/\/admin$/);
}

// Remove any test modules left over from a prior run so reruns don't accumulate
// and DOM-order assertions start from a known-empty list. Deleting the module
// cascades to its materials (onDelete: Cascade).
async function cleanupTestModules() {
  await prisma.module.deleteMany({
    where: { title: { startsWith: TEST_MODULE_PREFIX } },
  });
}

test.beforeAll(async () => {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD tidak ditemukan di process.env maupun .env — seed admin dulu (npm run db:seed-admin).",
    );
  }
  await cleanupTestModules();
});

test.afterAll(async () => {
  await cleanupTestModules();
  await prisma.$disconnect();
});

test("keamanan: anon tidak bisa buka /admin/.../modul (redirect ke /masuk)", async ({
  page,
}) => {
  await page.goto(`/admin/layanan/${CLASS_SERVICE_ID}/modul`);
  await page.waitForURL(/\/masuk/);
  expect(page.url()).toContain("/masuk");
});

test("modul: layanan konsultasi diblokir (bukan kelas digital, tanpa form Tambah Modul)", async ({
  page,
}) => {
  await loginAsAdmin(page);

  await page.goto(`/admin/layanan/${CONSULT_SERVICE_ID}/modul`);
  await expect(
    page.getByText(/Layanan ini bukan kelas digital/i),
  ).toBeVisible();

  // The builder form must NOT be rendered for a consultation service.
  await expect(
    page.getByRole("button", { name: "Tambah Modul" }),
  ).toHaveCount(0);
});

test("modul: buat dua modul lalu reorder (Naik) mengubah urutan", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto(`/admin/layanan/${CLASS_SERVICE_ID}/modul`);

  // The module list is the only <ol> on this page; each module is an <li>.
  const rows = page.locator("ol > li");

  // Add "Modul Uji A".
  await page.getByLabel("Judul Modul").fill(`${TEST_MODULE_PREFIX} A`);
  await page.locator("form").getByRole("button", { name: "Tambah Modul" }).click();
  await expect(
    rows.filter({ hasText: `${TEST_MODULE_PREFIX} A` }),
  ).toHaveCount(1);

  // Add "Modul Uji B" — lands at the end (below A).
  await page.getByLabel("Judul Modul").fill(`${TEST_MODULE_PREFIX} B`);
  await page.locator("form").getByRole("button", { name: "Tambah Modul" }).click();
  await expect(
    rows.filter({ hasText: `${TEST_MODULE_PREFIX} B` }),
  ).toHaveCount(1);

  // Initial order: A, then B.
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText(`${TEST_MODULE_PREFIX} A`);
  await expect(rows.nth(1)).toContainText(`${TEST_MODULE_PREFIX} B`);

  // Click "Naik" on B's row (scoped to that row to avoid the per-row twins).
  await rows
    .filter({ hasText: `${TEST_MODULE_PREFIX} B` })
    .getByRole("button", { name: "Naik" })
    .click();

  // Order becomes B, then A (auto-retries until the revalidation lands).
  await expect(rows.nth(0)).toContainText(`${TEST_MODULE_PREFIX} B`);
  await expect(rows.nth(1)).toContainText(`${TEST_MODULE_PREFIX} A`);
});

test("materi: tambah materi tipe PDF (preview) muncul dengan badge", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto(`/admin/layanan/${CLASS_SERVICE_ID}/modul`);

  const moduleTitle = `${TEST_MODULE_PREFIX} Materi`;
  const rows = page.locator("ol > li");

  // Create a module to hold the material.
  await page.getByLabel("Judul Modul").fill(moduleTitle);
  await page.locator("form").getByRole("button", { name: "Tambah Modul" }).click();
  await expect(rows.filter({ hasText: moduleTitle })).toHaveCount(1);

  // Open it via its Edit link -> /modul/[moduleId].
  await rows
    .filter({ hasText: moduleTitle })
    .getByRole("link", { name: "Edit" })
    .click();
  await page.waitForURL(
    new RegExp(`/admin/layanan/${CLASS_SERVICE_ID}/modul/[^/]+$`),
  );
  await expect(
    page.getByRole("heading", { name: "Edit Modul" }),
  ).toBeVisible();

  // Add a PDF material, marked as preview, via the MaterialManager form.
  const materialForm = page.locator("form").filter({
    has: page.getByRole("button", { name: "Tambah Materi" }),
  });
  await materialForm.getByLabel("Judul Materi").fill("Materi PDF Uji");
  await materialForm.getByLabel("Tipe").selectOption("PDF");
  await materialForm.getByRole("switch").click(); // mark as preview
  await materialForm.getByRole("button", { name: "Tambah Materi" }).click();

  // The material is listed with its PDF badge and Preview badge.
  const materialRow = page
    .getByRole("listitem")
    .filter({ hasText: "Materi PDF Uji" });
  await expect(materialRow).toHaveCount(1);
  await expect(materialRow).toContainText("PDF");
  await expect(materialRow).toContainText("Preview");
});
