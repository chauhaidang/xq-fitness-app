/**
 * Global setup/teardown for Detox E2E tests.
 * Uses App controller from xq-test-utils (e2e-app skill).
 * Never uses Detox's `device` global directly.
 *
 * Lifecycle:
 *  beforeAll  — install + first launch (once per file)
 *  beforeEach — kill + restart, then pull-to-refresh so each test
 *               starts on a clean routine list with up-to-date data
 *  afterAll   — terminate after all tests in the file
 */
import { App, screen } from '@chauhaidang/xq-test-utils';

const { by } = screen;

beforeAll(async () => {
  await App.launch({ newInstance: true });
});

beforeEach(async () => {
  await App.relaunch();

  // Wait for the routine list to finish loading after relaunch
  await screen.waitFor(by.id('routine-list-screen')).toBeVisible({ timeout: 15_000 });

  // Dismiss any error alert (e.g. startup fetch failure)
  try {
    await screen.waitFor(by.text('OK')).toBeVisible({ timeout: 2_000 });
    await screen.element(by.text('OK')).tap();
  } catch { /* no alert */ }

  // Pull to refresh — ensures the list reflects the latest DB state
  // (previous test's afterEach deletes data via API; PTR confirms it's gone)
  await screen.element(by.id('routine-list')).swipe('down', 'slow', 0.5);
});

afterAll(async () => {
  await App.terminate();
});
