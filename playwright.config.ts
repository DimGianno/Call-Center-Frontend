import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  reporter: "list",
  outputDir: "test-results/playwright",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    actionTimeout: 5_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: process.env.CI
    ? {
        command: "npm run dev:test",
        env: {
          VITE_API_URL: "/api",
        },
        reuseExistingServer: false,
        timeout: 120_000,
        url: "http://127.0.0.1:4173",
      }
    : undefined,
});
