import { defineConfig, devices } from "@playwright/test";

const FRONTEND_URL = "http://localhost:3000";
const BACKEND_URL = "http://localhost:8089";

export default defineConfig({
  testDir: "./e2e",
  // These drive one shared database, so they run serially. Parallel workers
  // would race on the fixtures each spec registers.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  // One retry even locally: these drive a dev server over real sockets, which
  // occasionally drops a keep-alive connection (ECONNRESET) unrelated to the
  // code under test. A second attempt distinguishes that from a real failure.
  retries: 1,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  // Both servers are started here so `npx playwright test` is a single command.
  // reuseExistingServer keeps a dev server you already have running.
  webServer: [
    {
      command: "npm start",
      cwd: "../backend",
      url: `${BACKEND_URL}/api/v1/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "npm run dev",
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
