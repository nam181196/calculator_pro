import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:       './tests/e2e',
  fullyParallel: false,   // Calculator là stateful — chạy tuần tự để tránh port conflict
  timeout:       15_000,

  use: {
    baseURL:    'http://localhost:3000',
    headless:   true,
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome']  } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari']  } },
  ],

  webServer: {
    // Dùng python3 built-in HTTP server — không cần install thêm
    command:              'python3 -m http.server 3000',
    url:                  'http://localhost:3000',
    reuseExistingServer:  !process.env.CI,
    timeout:              10_000,
  },
})
