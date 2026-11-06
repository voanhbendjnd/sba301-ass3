/**
 * Author: Võ Anh Ben - CE190709
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 3,
  timeout: 30000,
  reporter: [['list'], ['json', { outputFile: 'docs/evidence/e2e-results.json' }]],
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chromium',
    baseURL: 'http://127.0.0.1:5174',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
