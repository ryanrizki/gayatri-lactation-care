import { test, expect, type Locator } from "@playwright/test";

// Drive a React-controlled <input type="range">. Playwright's fill() sets the DOM
// value but does not fire React's onChange, so the controlled state never updates
// (React re-renders and resets the value). Setting the value through the native
// setter and dispatching a bubbling "input" event triggers React's synthetic
// onChange deterministically — no arbitrary waits needed.
async function setRange(slider: Locator, value: number) {
  await slider.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

// E2E smoke tests locking in the migrated Next.js App Router behavior.
// Currency strings use Intl.NumberFormat("id-ID", { currency: "IDR" }), whose
// separator after "Rp" is a NON-BREAKING space (U+00A0). Regex matchers with \s
// tolerate both nbsp and a regular space and skip Playwright's string whitespace
// normalization, so we use them for every money assertion.

test("beranda render hero dan program", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Perjalanan menyusui Mama",
  );
  // Four program cards on the home page.
  await expect(page.getByText("Induksi Laktasi")).toBeVisible();
  await expect(page.getByText("Persiapan Menyusui Ibu Hamil")).toBeVisible();
  await expect(page.getByText("Pendampingan Menyusui 2th")).toBeVisible();
  await expect(page.getByText("Pendampingan Ibu Kembali Bekerja")).toBeVisible();
});

test("halaman layanan menampilkan daftar paket", async ({ page }) => {
  await page.goto("/layanan");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Pendampingan Laktasi",
  );
  await expect(page.getByText("Konsultasi Laktasi Homecare")).toBeVisible();
});

test("alur konsultasi: pilih paket, hitung tarif, reservasi", async ({ page }) => {
  await page.goto("/layanan/laktasi_homecare");
  // Default distance 4 km (inside 5 km free radius) => flat transport Rp 15.000.
  await expect(page.getByText("Transport & akomodasi")).toBeVisible();
  await expect(page.getByText(/Rp\s?15\.000/)).toBeVisible();

  await page.getByRole("button", { name: "Lanjut ke Reservasi" }).click();
  await expect(page).toHaveURL("/layanan/laktasi_homecare/booking");

  await page.getByPlaceholder("Contoh: Rania Kirana").fill("Mama Uji");
  await page.getByPlaceholder("812345678").fill("81200000000");
  await page.locator('input[type="date"]').fill("2026-08-01");

  await page.getByRole("button", { name: "Konfirmasi Reservasi" }).click();
  await expect(page.getByText("Pendaftaran Berhasil!")).toBeVisible();
});

test("alur kelas digital: butuh login (real auth) sebelum beli", async ({ page }) => {
  // Logged out -> gate shows the login prompt, not a buy confirmation.
  await page.goto("/layanan/kelas_menyusui/booking");
  await expect(page.getByText("Masuk untuk membeli kelas")).toBeVisible();

  // Register a fresh user; the register action auto-signs-in and redirects to "/".
  const email = `mama_${Date.now()}@uji.test`;
  await page.goto("/daftar");
  await page.getByLabel(/nama/i).fill("Mama Uji");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill("RahasiaMama123");
  await page.getByRole("button", { name: /daftar/i }).click();
  await page.waitForURL("/");

  // Now logged in -> buy the class.
  await page.goto("/layanan/kelas_menyusui/booking");
  await page.getByRole("button", { name: "Konfirmasi Pembelian" }).click();
  await expect(page.getByText("Pembelian Berhasil!")).toBeVisible();
});

test("state funnel bertahan lintas navigasi (jarak terbawa ke booking)", async ({
  page,
}) => {
  await page.goto("/layanan/laktasi_homecare");
  // Slider to 20 km: total = base 350.000 + (20-5)*6000 = 90.000 => 440.000.
  await setRange(page.locator('input[type="range"]'), 20);
  // Distance label reflects the new value immediately (controlled state updated).
  await expect(page.getByText("20 KM")).toBeVisible();
  // Total is computed via async /api/estimator; toBeVisible auto-retries until settled.
  await expect(page.getByText(/Rp\s?440\.000/)).toBeVisible();

  await page.getByRole("button", { name: "Lanjut ke Reservasi" }).click();
  await expect(page).toHaveURL("/layanan/laktasi_homecare/booking");

  // Distance state carried across the navigation (React Context replacement for
  // react-router outlet context). A lost state would reset to 4 km / Rp 365.000
  // (base 350.000 + flat transport 15.000 inside the 5 km free radius).
  await expect(page.getByText("(20 km)")).toBeVisible();
  await expect(page.getByText(/Rp\s?440\.000/)).toBeVisible();
});

test("url tidak dikenal menampilkan branded 404 (dua bentuk)", async ({ page }) => {
  // Unknown top-level route -> root not-found.
  await page.goto("/entah-apa");
  await expect(page.getByText("Halaman tidak ditemukan")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Kembali ke Beranda" }),
  ).toBeVisible();

  // Unknown package id -> same branded 404 (dynamic route + not-found boundary).
  await page.goto("/layanan/paket-hantu");
  await expect(page.getByText("Halaman tidak ditemukan")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Kembali ke Beranda" }),
  ).toBeVisible();
});
