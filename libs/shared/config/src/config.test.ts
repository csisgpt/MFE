import { afterEach, expect, test, vi } from 'vitest';
import { getConfig, loadRuntimeConfig } from './index';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('loadRuntimeConfig falls back to defaults when fetch fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
  await loadRuntimeConfig();
  expect(getConfig().apiBaseUrl).toBe('/api');
});

test('loadRuntimeConfig merges remote values', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ apiBaseUrl: '/api/mock', featureFlags: { enableReports: false } })
    })
  );
  await loadRuntimeConfig();
  expect(getConfig().apiBaseUrl).toBe('/api/mock');
  expect(getConfig().featureFlags.enableReports).toBe(false);
});
