import { defineConfig, devices } from "@playwright/test";

/**
 * Uçtan uca testler: API (4000), admin (3001) ve web (3000) çalışırken
 * `pnpm test:e2e` ile çalıştırılır. Ayrıntılar: e2e/README.md
 */
const chromePath = process.env.CHROME_PATH;

export default defineConfig({
  testDir: "./e2e/tests",
  // Testler aynı veritabanını paylaşır: sırayla çalışır
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e/report" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.ADMIN_URL ?? "http://localhost:3001",
    storageState: "e2e/.auth/admin.json",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 950 },
    ...devices["Desktop Chrome"],
    ...(chromePath ? { launchOptions: { executablePath: chromePath } } : {}),
  },
});
