import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync, copyFileSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

// Playwright's runner does not load .env (only Next's dev server does). We parse
// .env at module load to obtain the DB URL and UPLOAD_DIR, falling back to any
// values already present in process.env. No secrets are referenced here — this
// spec is fully anonymous (no login). (Same pattern as e2e/kelas-saya.spec.ts.)
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

// Seeded digital-class service used for the public-detail assertions. We use
// kelas_bekerja (NOT kelas_menyusui) so our seeded modules never pollute the
// module list that admin-modul.spec asserts an absolute `ol > li` count on when
// Playwright runs the two files concurrently. Our assertions are scoped to
// specific module ids, so kelas_bekerja carries no such collision.
const CLASS_SERVICE_ID = "kelas_bekerja";
// Seeded consultation service — its fee calculator must remain unchanged.
const CONSULT_SERVICE_ID = "laktasi_homecare";

// Distinct prefix so this file's teardown never touches other specs' data and
// reruns start from a clean slate.
const TEST_MODULE_PREFIX = "Modul Publik E2E";

// Absolute path to the committed video fixture.
const FIXTURE_MP4 = resolve(process.cwd(), "e2e/fixtures/sample.mp4");

// Direct Prisma client for setup/cleanup, wired to the resolved DATABASE_URL so
// it works even though the Playwright process never loaded .env.
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

// Ids seeded in beforeAll and reused across the tests.
let previewModuleId = "";
let nonPreviewModuleId = "";

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
// UPLOAD_DIR doesn't accumulate. Module delete cascades to its materials.
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
}

test.beforeAll(async () => {
  await cleanupTestData();

  // A free preview video module — servable to anyone, even anonymous. sortOrder
  // 0 so it renders first ("Modul 1").
  const preview = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} — Preview`,
      description: "Modul preview gratis untuk uji detail publik.",
      sortOrder: 0,
      isPreview: true,
      videoPath: copyFixture(FIXTURE_MP4, "videos", ".mp4"),
    },
  });
  previewModuleId = preview.id;

  // A paid (non-preview) video module — locked for anon; no <video> in the DOM.
  const nonPreview = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} — Berbayar`,
      description: "Modul berbayar untuk uji detail publik.",
      sortOrder: 1,
      isPreview: false,
      videoPath: copyFixture(FIXTURE_MP4, "videos", ".mp4"),
    },
  });
  nonPreviewModuleId = nonPreview.id;
});

test.afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test("anon: modul preview memutar cuplikan gratis (<video> ada + stream 200)", async ({
  page,
}) => {
  await page.goto(`/layanan/${CLASS_SERVICE_ID}`);

  // The preview module's title is shown and its <video> element points at the
  // gated route for the preview module id.
  await expect(
    page.getByText(`${TEST_MODULE_PREFIX} — Preview`),
  ).toBeVisible();
  const previewVideo = page.locator(
    `video[src*="/api/video/${previewModuleId}"]`,
  );
  await expect(previewVideo).toHaveCount(1);

  // The preview video streams for an anonymous visitor.
  const res = await page.request.get(`/api/video/${previewModuleId}`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("video/mp4");
});

test("anon: modul berbayar terkunci (judul tampil, tanpa <video>, stream 403)", async ({
  page,
}) => {
  await page.goto(`/layanan/${CLASS_SERVICE_ID}`);

  // The non-preview module's title is visible (listed, but locked)...
  await expect(
    page.getByText(`${TEST_MODULE_PREFIX} — Berbayar`),
  ).toBeVisible();

  // ...yet no <video> element references the non-preview module id.
  await expect(
    page.locator(`video[src*="/api/video/${nonPreviewModuleId}"]`),
  ).toHaveCount(0);

  // The gated (non-preview) video is forbidden for an anonymous visitor.
  const res = await page.request.get(`/api/video/${nonPreviewModuleId}`);
  expect(res.status()).toBe(403);
});

test("anon: tombol Beli Kelas tetap ada di detail kelas", async ({ page }) => {
  await page.goto(`/layanan/${CLASS_SERVICE_ID}`);
  await expect(
    page.getByRole("button", { name: "Beli Kelas" }),
  ).toBeVisible();
});

test("regresi konsultasi: kalkulator tarif tetap tampil (tak berubah)", async ({
  page,
}) => {
  await page.goto(`/layanan/${CONSULT_SERVICE_ID}`);
  await expect(
    page.getByText(/Kalkulator Tarif Transparan/i),
  ).toBeVisible();
  await expect(page.getByText(/Transport & akomodasi/i)).toBeVisible();
  await expect(page.getByText(/Total rencana bayar/i)).toBeVisible();
});
