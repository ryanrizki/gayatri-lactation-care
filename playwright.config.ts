import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Serial: one dev server compiles routes lazily and several specs mutate the
  // same seeded class (kelas_bekerja); parallel workers cause compile-timeout and
  // cross-spec DB races. Serial keeps the suite deterministic.
  workers: 1,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
