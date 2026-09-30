import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 120_000,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: `${process.env.QA_OUTPUT ?? "docs/qa"}/browser-results.json` }]],
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:3300",
    browserName: "chromium",
    channel: "msedge",
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    trace: "off",
  },
});
