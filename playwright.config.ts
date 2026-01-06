import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  retries: 0,
  use: {
    baseURL: 'http://csis.ir:4990',
    headless: true
  },
  webServer: {
    command: 'pnpm nx run-many -t serve --projects=shell,app-one,app-two,insurance,admission,ops --parallel',
    url: 'http://csis.ir:4990',
    reuseExistingServer: true,
    timeout: 120000
  }
});
