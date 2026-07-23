import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";

// Playwright's runner does not load .env (only Next's dev server does). We parse
// .env at module load to obtain the admin password, DB URL, and UPLOAD_DIR,
// falling back to any values already present in process.env. The password is
// NEVER hardcoded here — only the non-secret default admin email is referenced
// as a fallback. (Same pattern as e2e/admin-modul.spec.ts.)
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
const UPLOAD_DIR = process.env.UPLOAD_DIR || dotenv.UPLOAD_DIR || "./uploads";

// Seeded digital-class service used for the module-builder flows. We use
// kelas_bekerja (not kelas_menyusui) so our seeded module never pollutes the
// module list that admin-modul.spec asserts a count on when the two files run
// concurrently.
const CLASS_SERVICE_ID = "kelas_bekerja";
// Distinct prefix so this file's teardown never collides with admin-modul.spec
// (which matches "Modul Uji"); Playwright may run the two files concurrently.
const TEST_MODULE_PREFIX = "Modul E2E Upload";
const MATERIAL_TITLE = "Materi PDF E2E";

// Absolute paths to the committed fixtures.
const FIXTURE_MP4 = resolve(process.cwd(), "e2e/fixtures/sample.mp4");
const FIXTURE_PDF = resolve(process.cwd(), "e2e/fixtures/sample.pdf");

// Direct Prisma client for setup/cleanup, wired to the resolved DATABASE_URL so
// it works even though the Playwright process never loaded .env.
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

// The moduleId we seed in beforeAll and reuse across the tests.
let moduleId = "";

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

// Unlink an uploaded file (relative to UPLOAD_DIR) if present; ignore misses so
// cleanup is idempotent across reruns.
async function unlinkUpload(relPath: string | null | undefined) {
  if (!relPath) return;
  await unlink(resolve(process.cwd(), UPLOAD_DIR, relPath)).catch(() => {});
}

// Delete every test module left by this file (by prefix), first unlinking any
// files it uploaded so ./uploads doesn't accumulate. Deleting the module
// cascades to its materials (onDelete: Cascade).
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
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD tidak ditemukan di process.env maupun .env — seed admin dulu (npm run db:seed-admin).",
    );
  }
  await cleanupTestData();
  const mod = await prisma.module.create({
    data: {
      serviceId: CLASS_SERVICE_ID,
      title: `${TEST_MODULE_PREFIX} A`,
      description: "Modul untuk uji unggah video & materi.",
    },
  });
  moduleId = mod.id;
});

test.afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test("unggah video → tersimpan (videoPath) → disajikan dengan Range", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto(`/admin/layanan/${CLASS_SERVICE_ID}/modul/${moduleId}`);
  await expect(page.getByRole("heading", { name: "Edit Modul" })).toBeVisible();

  // Scope to the module (detail) form — the one with "Simpan Perubahan".
  const moduleForm = page.locator("form").filter({
    has: page.getByRole("button", { name: "Simpan Perubahan" }),
  });

  // Set the mp4 on the (sr-only) file input, then wait for the XHR upload to
  // populate the hidden videoPath and surface the success text.
  await moduleForm.locator('input[type="file"]').setInputFiles(FIXTURE_MP4);
  await expect(moduleForm.getByText(/Terunggah/)).toBeVisible({
    timeout: 20_000,
  });

  // Persist via the existing updateModuleAction, then confirm the path landed
  // in the DB (starts with "videos/"). The action only revalidates, so we poll.
  await moduleForm.getByRole("button", { name: "Simpan Perubahan" }).click();
  await expect
    .poll(
      async () =>
        (await prisma.module.findUnique({ where: { id: moduleId } }))
          ?.videoPath ?? "",
      { timeout: 15_000 },
    )
    .toMatch(/^videos\//);

  // Serve it back through the auth-gated route (page.request carries the admin
  // session cookie from the logged-in browser context).
  const full = await page.request.get(`/api/video/${moduleId}`);
  expect(full.status()).toBe(200);
  expect(full.headers()["content-type"]).toContain("video/mp4");

  // A Range request yields 206 Partial Content with a Content-Range header.
  const partial = await page.request.get(`/api/video/${moduleId}`, {
    headers: { Range: "bytes=0-10" },
  });
  expect(partial.status()).toBe(206);
  expect(partial.headers()["content-range"]).toMatch(/^bytes 0-10\/\d+$/);
});

test("unggah materi PDF → disajikan sebagai application/pdf", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto(`/admin/layanan/${CLASS_SERVICE_ID}/modul/${moduleId}`);
  await expect(page.getByRole("heading", { name: "Edit Modul" })).toBeVisible();

  // Scope to the "Tambah Materi" form. Type defaults to PDF, so the
  // FileUploadField (a file <input>) is rendered.
  const materialForm = page.locator("form").filter({
    has: page.getByRole("button", { name: "Tambah Materi" }),
  });
  await materialForm.getByLabel("Judul Materi").fill(MATERIAL_TITLE);
  await materialForm.getByLabel("Tipe").selectOption("PDF");

  await materialForm.locator('input[type="file"]').setInputFiles(FIXTURE_PDF);
  await expect(materialForm.getByText(/Terunggah/)).toBeVisible({
    timeout: 20_000,
  });

  await materialForm.getByRole("button", { name: "Tambah Materi" }).click();

  // The created material should carry a "materials/…" filePath.
  await expect
    .poll(
      async () =>
        (
          await prisma.material.findFirst({
            where: { moduleId, title: MATERIAL_TITLE },
          })
        )?.filePath ?? "",
      { timeout: 15_000 },
    )
    .toMatch(/^materials\//);

  const mat = await prisma.material.findFirst({
    where: { moduleId, title: MATERIAL_TITLE },
  });
  expect(mat).not.toBeNull();

  const res = await page.request.get(`/api/material/${mat!.id}`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
});

test("keamanan: anon tidak bisa unggah maupun mengambil file (403)", async ({
  request,
}) => {
  // The `request` fixture is a fresh context with NO browser cookies.
  const upload = await request.post(
    "/api/admin/upload?kind=video&filename=x.mp4",
    { headers: { "content-type": "video/mp4" }, data: "x" },
  );
  expect(upload.status()).toBe(403);

  const serve = await request.get(`/api/video/${moduleId}`);
  expect(serve.status()).toBe(403);
});
