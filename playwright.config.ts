import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config';

// Firefox and WebKit only run when ALL_BROWSERS is set (nightly pipeline)
const extraBrowsers = process.env.ALL_BROWSERS
  ? [
      { name: 'ui-firefox', testDir: './tests/ui', use: { ...devices['Desktop Firefox'], locale: 'en-US' } },
      { name: 'ui-webkit', testDir: './tests/ui', use: { ...devices['Desktop Safari'], locale: 'en-US' } },
    ]
  : [];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],
  expect: {
    // The local Toolshop is slow (emulated API server, development build): allow 10 s instead of 5
    timeout: 10_000
  },
  use: {
    baseURL: config.uiUrl,
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'ui-chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'], locale: 'en-US' } },
    { name: 'a11y', testDir: './tests/a11y', use: { ...devices['Desktop Chrome'], locale: 'en-US' } },
    { name: 'visual', testDir: './tests/visual', use: { ...devices['Desktop Chrome'], locale: 'en-US' } },
    ...extraBrowsers,
  ],
});