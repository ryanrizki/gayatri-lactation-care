import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Playwright's runner does not load .env (only Next's dev server does). We parse
// .env at module load to obtain the admin password and DB URL, falling back to
// any values already present in process.env. The password is NEVER hardcoded
// here — only the non-secret default admin email is referenced as a fallback.
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

const E2E_SERVICE_NAME = "Kelas E2E Test";
const E2E_SERVICE_SLUG = "kelas-e2e-test";

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
  // LoginFormReal sets window.location.href = callbackUrl ("/") on success.
  await page.waitForURL("http://localhost:3000/");
}

test.beforeAll(() => {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD tidak ditemukan di process.env maupun .env — seed admin dulu (npm run db:seed-admin).",
    );
  }
});

test.afterAll(async () => {
  // Keep the DB clean across reruns: remove any service created by the
  // create-flow test and restore the edited seed price as a safety net.
  await prisma.service.deleteMany({ where: { name: E2E_SERVICE_NAME } });
  await prisma.service.updateMany({
    where: { id: "laktasi_klinik" },
    data: { price: 250000 },
  });
  await prisma.$disconnect();
});

test("keamanan: anon tidak bisa buka /admin (redirect ke /masuk)", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.waitForURL(/\/masuk/);
  expect(page.url()).toContain("/masuk");
});

test("keamanan: USER biasa tidak bisa buka /admin (redirect ke /)", async ({
  page,
}) => {
  // Register a fresh USER-role account; registerUser auto-signs-in and redirects
  // to "/".
  const email = `user_${Date.now()}@uji.test`;
  await page.goto("/daftar");
  await page.getByLabel(/nama/i).fill("Mama Uji");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill("RahasiaMama123");
  await page.getByRole("button", { name: /daftar/i }).click();
  await page.waitForURL("http://localhost:3000/");

  // A USER hitting an admin path is redirected home by the auth middleware.
  await page.goto("/admin");
  await page.waitForURL("http://localhost:3000/");
  expect(page.url()).not.toContain("/admin");
});

test("admin edit harga layanan → ter-reflect di halaman publik", async ({
  page,
}) => {
  await loginAsAdmin(page);

  // Edit the seeded "Konsultasi Laktasi Klinik" (id laktasi_klinik) to a
  // distinctive price.
  await page.goto("/admin/layanan/laktasi_klinik");
  await page.getByLabel("Harga (Rp)").fill("251000");
  await page.locator("form").getByRole("button", { name: "Simpan" }).click();
  await page.waitForURL("http://localhost:3000/admin/layanan");

  // Public listing reflects the new price (nbsp-tolerant matcher).
  await page.goto("/layanan");
  await expect(page.getByText(/Rp\s?251\.000/)).toBeVisible();

  // Restore to the original seed price so the DB stays clean.
  await page.goto("/admin/layanan/laktasi_klinik");
  await page.getByLabel("Harga (Rp)").fill("250000");
  await page.locator("form").getByRole("button", { name: "Simpan" }).click();
  await page.waitForURL("http://localhost:3000/admin/layanan");
  await page.goto("/layanan");
  await expect(page.getByText(/Rp\s?250\.000/)).toBeVisible();
});

test("admin buat layanan baru → muncul publik tanpa rebuild (dinamis)", async ({
  page,
}) => {
  await loginAsAdmin(page);

  await page.goto("/admin/layanan/baru");
  await page.getByLabel("Nama layanan").fill(E2E_SERVICE_NAME);
  await page.getByLabel("Kategori").selectOption("class");
  await page.getByLabel("Harga (Rp)").fill("199000");
  await page
    .getByLabel("Deskripsi")
    .fill("Deskripsi kelas E2E untuk pengujian otomatis alur admin.");
  await page.getByLabel("Fitur 1", { exact: true }).fill("Materi lengkap E2E");
  await page
    .getByLabel("URL gambar")
    .fill("https://picsum.photos/seed/gayatri-e2e/800/600");
  await page.locator("form").getByRole("button", { name: "Simpan" }).click();
  await page.waitForURL("http://localhost:3000/admin/layanan");

  // Appears in the public listing without any rebuild.
  await page.goto("/layanan");
  await expect(page.getByText(E2E_SERVICE_NAME)).toBeVisible();

  // Dynamic detail route renders (200 + name), proving no static prebuild needed.
  const res = await page.goto(`/layanan/${E2E_SERVICE_SLUG}`);
  expect(res?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: E2E_SERVICE_NAME }),
  ).toBeVisible();
});
