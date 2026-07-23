import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Playwright's runner does not load .env (only Next's dev server does). We parse
// .env at module load to obtain the admin password and DB URL, falling back to
// any values already present in process.env. The password is NEVER hardcoded
// here — only the non-secret default admin email is referenced as a fallback.
// (Same pattern as e2e/admin.spec.ts / admin-modul.spec.ts.)
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

// Seeded digital-class service used for the purchase flow.
const CLASS_SERVICE_ID = "kelas_menyusui";
// Distinct email domain so teardown never touches other specs' @uji.test users,
// and so reruns can wipe exactly the accounts this file creates.
const TEST_EMAIL_DOMAIN = "@enroll-e2e.test";
const USER_PASSWORD = "RahasiaMama123";

// Direct Prisma client for assertions/cleanup, wired to the resolved DATABASE_URL
// so it works even though the Playwright process never loaded .env.
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

// Unique per run so concurrent/repeat runs never collide on the user+service
// unique constraint. Shared by the serial buy → confirm → access flow below.
const userEmail = `enroll_${Date.now()}${TEST_EMAIL_DOMAIN}`;
const userName = "Mama Enroll E2E";

// Log in through the real /masuk form. The header also renders a "Masuk" link,
// so the submit button is scoped to the form (button role vs. link role).
async function loginAsAdmin(page: Page) {
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
  await page.locator("form").getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL(/\/admin$/);
}

// Register a fresh account; registerUser auto-signs-in and redirects to "/".
async function registerUser(page: Page, email: string) {
  await page.goto("/daftar");
  await page.getByLabel(/nama/i).fill(userName);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(USER_PASSWORD);
  await page.getByRole("button", { name: /daftar/i }).click();
  await page.waitForURL("http://localhost:3000/");
}

// Log a previously-registered user in via the real /masuk form.
async function loginAsUser(page: Page, email: string) {
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(USER_PASSWORD);
  await page.locator("form").getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL("**/kelas-saya");
}

// Delete every account this file may have created (by email domain), first
// removing their enrollments. Enrollment cascades on user delete, but we delete
// explicitly to be safe and so reruns start from a clean slate.
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
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD tidak ditemukan di process.env maupun .env — seed admin dulu (npm run db:seed-admin).",
    );
  }
  await cleanupTestData();
});

test.afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

// The buy → idempotent → admin-confirm → access flow is inherently sequential:
// each step depends on the enrollment left by the previous one. Serial mode
// keeps them ordered on one worker and skips the rest on the first failure.
test.describe.serial("alur enrollment kelas digital", () => {
  test("user beli kelas → status PENDING + link wa.me + baris PENDING di DB", async ({
    page,
  }) => {
    await registerUser(page, userEmail); // auto sign-in

    await page.goto(`/layanan/${CLASS_SERVICE_ID}/booking`);
    await page.getByRole("button", { name: "Beli Kelas" }).click();

    // handleBuy() creates the enrollment then router.refresh(); the panel flips
    // to the "awaiting payment" state (auto-retrying assertion, no fixed wait).
    await expect(
      page.getByRole("heading", { name: "Menunggu Konfirmasi Pembayaran" }),
    ).toBeVisible();
    // A WhatsApp confirmation link must be present in the PENDING panel.
    await expect(page.locator('a[href*="wa.me"]')).toBeVisible();

    // DB: exactly the enrollment we expect, PENDING, for this user + service.
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    expect(user).not.toBeNull();
    await expect
      .poll(async () => {
        const e = await prisma.enrollment.findUnique({
          where: {
            userId_serviceId: { userId: user!.id, serviceId: CLASS_SERVICE_ID },
          },
        });
        return e?.status ?? null;
      })
      .toBe("PENDING");
  });

  test("idempoten: reload halaman booking → tetap tepat SATU enrollment PENDING", async ({
    page,
  }) => {
    await loginAsUser(page, userEmail);

    await page.goto(`/layanan/${CLASS_SERVICE_ID}/booking`);
    // Already PENDING from the previous test — server renders the same panel.
    await expect(
      page.getByRole("heading", { name: "Menunggu Konfirmasi Pembayaran" }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Menunggu Konfirmasi Pembayaran" }),
    ).toBeVisible();

    // No duplicate row was created: still exactly one, still PENDING.
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: userEmail },
    });
    const count = await prisma.enrollment.count({
      where: { userId: user.id, serviceId: CLASS_SERVICE_ID },
    });
    expect(count).toBe(1);
    const enr = await prisma.enrollment.findUnique({
      where: {
        userId_serviceId: { userId: user.id, serviceId: CLASS_SERVICE_ID },
      },
    });
    expect(enr?.status).toBe("PENDING");
  });

  test("admin Tandai Lunas → PAID + confirmedById; user melihat akses aktif", async ({
    page,
    browser,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/enrollment?status=PENDING");

    // Scope to THIS user's row (the per-row "Tandai Lunas" button is duplicated
    // across rows); the header row does not contain the email.
    const row = page.getByRole("row").filter({ hasText: userEmail });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Tandai Lunas" }).click();

    // DB: flipped to PAID with the confirming admin recorded.
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: userEmail },
    });
    await expect
      .poll(async () => {
        const e = await prisma.enrollment.findUnique({
          where: {
            userId_serviceId: { userId: user.id, serviceId: CLASS_SERVICE_ID },
          },
        });
        return e?.status ?? null;
      })
      .toBe("PAID");
    const enr = await prisma.enrollment.findUnique({
      where: {
        userId_serviceId: { userId: user.id, serviceId: CLASS_SERVICE_ID },
      },
    });
    expect(enr?.confirmedById).not.toBeNull();

    // The USER (fresh context) now sees the "already has access" state.
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    try {
      await loginAsUser(userPage, userEmail);
      await userPage.goto(`/layanan/${CLASS_SERVICE_ID}/booking`);
      await expect(
        userPage.getByRole("heading", { name: /sudah punya akses/i }),
      ).toBeVisible();
    } finally {
      await userCtx.close();
    }
  });
});

test("keamanan: anon diblokir dari /admin/enrollment & tidak bisa beli tanpa login", async ({
  page,
}) => {
  // The `page` fixture is a fresh context with NO cookies. /admin/enrollment is
  // gated → the middleware redirects to /masuk.
  await page.goto("/admin/enrollment");
  await page.waitForURL(/\/masuk/);
  expect(page.url()).toContain("/masuk");

  // Anonymous on a class booking page sees the login gate, not a working buy.
  await page.goto(`/layanan/${CLASS_SERVICE_ID}/booking`);
  await expect(page.getByText("Masuk untuk membeli kelas")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /masuk ke akun mama/i }),
  ).toHaveAttribute("href", /\/masuk/);
  await expect(page.getByRole("button", { name: "Beli Kelas" })).toHaveCount(0);
});
