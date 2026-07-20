import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync, copyFileSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

// Playwright's runner does not load .env (only Next's dev server does). We parse
// .env at module load to obtain the admin password, DB URL, and UPLOAD_DIR,
// falling back to any values already present in process.env. The password is
// NEVER hardcoded here — only the non-secret default admin email is referenced
// as a fallback. (Same pattern as e2e/admin-upload.spec.ts / enrollment.spec.ts.)
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
const DATABASE_URL = process.env.DATABASE_URL || dotenv.DATABASE_URL;
const UPLOAD_DIR = process.env.UPLOAD_DIR || dotenv.UPLOAD_DIR || "./uploads";

// Seeded digital-class service used for the access matrix. We use kelas_bekerja
// (NOT kelas_menyusui) so our seeded modules never pollute the module list that
// admin-modul.spec asserts an absolute `ol > li` count on when Playwright runs
// the two files concurrently. admin-upload.spec uses kelas_bekerja for the same
// reason; unlike an absolute count, neither file collides here — this spec's
// assertions are scoped to specific module ids / hrefs, not a total count.
const CLASS_SERVICE_ID = "kelas_bekerja";

// Distinct prefix / email domain so this file's teardown never touches other
// specs' data, and so reruns start from a clean slate.
const TEST_MODULE_PREFIX = "Modul Akses E2E";
const MATERIAL_TITLE = "Materi Akses E2E";
const TEST_EMAIL_DOMAIN = "@kelas-saya-e2e.test";
const USER_PASSWORD = "RahasiaMama123";

// Absolute paths to the committed fixtures.
const FIXTURE_MP4 = resolve(process.cwd(), "e2e/fixtures/sample.mp4");
const FIXTURE_PDF = resolve(process.cwd(), "e2e/fixtures/sample.pdf");

// Direct Prisma client for setup/cleanup, wired to the resolved DATABASE_URL so
// it works even though the Playwright process never loaded .env.
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

// Unique emails per run so repeat/concurrent runs never collide on the
// user+service unique constraint.
const userAEmail = `paid_${Date.now()}${TEST_EMAIL_DOMAIN}`;
const userBEmail = `free_${Date.now()}${TEST_EMAIL_DOMAIN}`;

// Ids seeded in beforeAll and reused across the tests.
let nonPreviewModuleId = "";
let previewModuleId = "";
let materialId = "";

// Register a fresh account; register auto-signs-in and redirects to "/".
async function registerUser(page: Page, email: string) {
  await page.goto("/daftar");
  await page.getByLabel(/nama/i).fill("Mama Akses E2E");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(USER_PASSWORD);
  await page.getByRole("button", { name: /daftar/i }).click();
  await page.waitForURL("http://localhost:3000/");
}

// Log a previously-registered user in via the real /masuk form. The header also
// renders a "Masuk" link, so the submit button is scoped to the form.
async function loginAsUser(page: Page, email: string) {
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(USER_PASSWORD);
  await page.locator("form").getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL("http://localhost:3000/");
}

// Copy a fixture into UPLOAD_DIR/<subdir>/<uuid><ext> and return the relative
// path stored on the DB row (e.g. "videos/<uuid>.mp4").
function copyFixture(fixture: string, subdir: string, ext: string): string {
  const rel = `${subdir}/${randomUUID()}${ext}`;
  copyFileSync(fixture, resolve(process.cwd(), UPLOAD_DIR, rel));
  return rel;
}

// Unlink an uploaded file (relative to UPLOAD_DIR) if present; ignore misses so
// cleanup is idempotent across reruns.
async function unlinkUpload(relPath: string | null | undefined) {
  if (!relPath) return;
  await unlink(resolve(process.cwd(), UPLOAD_DIR, relPath)).catch(() => {});
}

// Delete every test module (by prefix) — first unlinking the files it copied so
// UPLOAD_DIR doesn't accumulate — plus every account this file created (by email
// domain, with enrollments). Module delete cascades to its materials.
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

  // A real (non-preview) video module with a PDF material — the PAID-gated content.
  const videoRel = copyFixture(FIXTURE_MP4, "videos", ".mp4");
  const nonPreview = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} — Berbayar`,
      description: "Modul berbayar untuk uji akses.",
      sortOrder: 1,
      videoPath: videoRel,
      materials: {
        create: {
          title: MATERIAL_TITLE,
          type: "PDF",
          filePath: copyFixture(FIXTURE_PDF, "materials", ".pdf"),
        },
      },
    },
    include: { materials: true },
  });
  nonPreviewModuleId = nonPreview.id;
  materialId = nonPreview.materials[0].id;

  // A free preview video module — servable to anyone, even anonymous.
  const preview = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} — Preview`,
      description: "Modul preview gratis untuk uji akses.",
      sortOrder: 0,
      isPreview: true,
      videoPath: copyFixture(FIXTURE_MP4, "videos", ".mp4"),
    },
  });
  previewModuleId = preview.id;
});

test.afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test("userA (PAID) punya akses penuh: kartu kelas, halaman modul, video & materi 200", async ({
  page,
}) => {
  // Register userA and grant a confirmed (PAID) enrollment for the class.
  await registerUser(page, userAEmail);
  const userA = await prisma.user.findUniqueOrThrow({
    where: { email: userAEmail },
  });
  await prisma.enrollment.create({
    data: {
      userId: userA.id,
      serviceId: CLASS_SERVICE_ID,
      status: "PAID",
      confirmedAt: new Date(),
    },
  });

  // /kelas-saya lists the PAID class.
  await page.goto("/kelas-saya");
  const card = page.getByRole("link", { name: /Buka Kelas/i }).first();
  await expect(card).toBeVisible();
  await expect(
    page.locator(`a[href="/kelas-saya/${CLASS_SERVICE_ID}"]`),
  ).toBeVisible();

  // The class content page renders a <video> player.
  await page.goto(`/kelas-saya/${CLASS_SERVICE_ID}`);
  await expect(page).toHaveURL(new RegExp(`/kelas-saya/${CLASS_SERVICE_ID}$`));
  await expect(page.locator("video").first()).toBeVisible();

  // The gated video streams (200 full / 206 range) for the PAID buyer.
  const full = await page.request.get(`/api/video/${nonPreviewModuleId}`);
  expect(full.status()).toBe(200);
  expect(full.headers()["content-type"]).toContain("video/mp4");
  const partial = await page.request.get(`/api/video/${nonPreviewModuleId}`, {
    headers: { Range: "bytes=0-10" },
  });
  expect(partial.status()).toBe(206);

  // The gated PDF material serves for the PAID buyer.
  const pdf = await page.request.get(`/api/material/${materialId}`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("userB (non-PAID) diblokir: kelas tak muncul, halaman modul redirect, video 403", async ({
  page,
}) => {
  await registerUser(page, userBEmail);

  // /kelas-saya shows no class for a user without a PAID enrollment.
  await page.goto("/kelas-saya");
  await expect(
    page.locator(`a[href="/kelas-saya/${CLASS_SERVICE_ID}"]`),
  ).toHaveCount(0);

  // Direct navigation to the class page redirects away (to /layanan/<id>).
  await page.goto(`/kelas-saya/${CLASS_SERVICE_ID}`);
  await expect(page).not.toHaveURL(
    new RegExp(`/kelas-saya/${CLASS_SERVICE_ID}$`),
  );

  // The gated (non-preview) video is forbidden for a logged-in non-buyer.
  const res = await page.request.get(`/api/video/${nonPreviewModuleId}`);
  expect(res.status()).toBe(403);
});

test("anon: /kelas-saya redirect ke /masuk; video berbayar 403", async ({
  page,
  request,
}) => {
  // The `page` fixture is a fresh context with NO cookies → middleware/page gate
  // redirects to /masuk.
  await page.goto("/kelas-saya");
  await page.waitForURL(/\/masuk/);
  expect(page.url()).toContain("/masuk");

  // The `request` fixture carries no cookies → gated video is forbidden.
  const res = await request.get(`/api/video/${nonPreviewModuleId}`);
  expect(res.status()).toBe(403);
});

test("preview terbuka: anon boleh streaming video modul preview (200)", async ({
  request,
}) => {
  const res = await request.get(`/api/video/${previewModuleId}`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("video/mp4");
});
