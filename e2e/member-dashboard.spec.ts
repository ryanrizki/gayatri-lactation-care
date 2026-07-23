import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Playwright's runner does not load .env (only Next's dev server does). We parse
// .env at module load to obtain the admin credentials and DB URL, falling back
// to any values already present in process.env. The password is NEVER hardcoded
// here — only the non-secret default admin email is referenced as a fallback.
// (Same pattern as e2e/admin.spec.ts / kelas-saya.spec.ts.)
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

// Distinct email domain so teardown never touches other specs' data.
const TEST_EMAIL_DOMAIN = "@member-e2e.test";
const USER_PASSWORD = "RahasiaMama123";

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

const userEmail = `member_${Date.now()}${TEST_EMAIL_DOMAIN}`;

// Register a fresh account; register auto-signs-in and redirects to "/".
async function registerUser(page: Page, email: string) {
  await page.goto("/daftar");
  await page.getByLabel(/nama/i).fill("Mama Member E2E");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(USER_PASSWORD);
  await page.getByRole("button", { name: /daftar/i }).click();
  await page.waitForURL("http://localhost:3000/");
}

// Delete every account this file created (by email domain), first removing their
// enrollments, so reruns start from a clean slate.
async function cleanupTestData() {
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
});

test.afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test("USER login mendarat di /kelas-saya dengan shell dashboard member (bukan chrome publik)", async ({
  page,
}) => {
  await registerUser(page, userEmail);

  // Log in via the real /masuk form → default callbackUrl is now /kelas-saya.
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(userEmail);
  await page.getByLabel("Password").fill(USER_PASSWORD);
  await page.locator("form").getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL("**/kelas-saya");
  expect(page.url()).toContain("/kelas-saya");

  // The dashboard shell renders: a "Kelas Saya" nav link and the Keluar control.
  await expect(page.getByRole("link", { name: "Kelas Saya" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /keluar/i }).first()).toBeVisible();

  // The public "Mama" chrome (SiteHeader) is absent — its brand tagline is gone.
  await expect(page.getByText("Pusat Laktasi")).toHaveCount(0);
});

test("ADMIN login diarahkan ke /admin (bukan /kelas-saya)", async ({ page }) => {
  test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not available in env/.env");

  await page.goto("/masuk");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
  await page.locator("form").getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL(/\/admin$/);
  expect(page.url()).toContain("/admin");
});

test("anon: /kelas-saya redirect ke /masuk (gate layout member)", async ({ page }) => {
  await page.goto("/kelas-saya");
  await page.waitForURL(/\/masuk/);
  expect(page.url()).toContain("/masuk");
});
