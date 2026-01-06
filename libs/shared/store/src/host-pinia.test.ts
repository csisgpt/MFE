import { expect, test } from 'vitest';
import { getHostPinia } from './host-pinia';

test('getHostPinia throws when host not set', () => {
  expect(() => getHostPinia()).toThrow('پینیا‌ی میزبان تنظیم نشده است');
});
