import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  timeout: 30_000,
  webServer: {
    command: 'npm run dev -- --port 4177',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: true
  },
  use: {
    baseURL: 'http://127.0.0.1:4177',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
