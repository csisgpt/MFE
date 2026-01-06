import type { Pinia } from 'pinia';

const KEY = '__CSIS_HOST_PINIA__';

type GlobalWithHostPinia = typeof globalThis & {
  [KEY]?: Pinia;
};

export const setHostPinia = (pinia: Pinia) => {
  (globalThis as GlobalWithHostPinia)[KEY] = pinia;
};

export const getHostPinia = (): Pinia => {
  const pinia = (globalThis as GlobalWithHostPinia)[KEY];
  if (!pinia) {
    throw new Error('پینیا‌ی میزبان تنظیم نشده است. setHostPinia() را در شِل فراخوانی کنید.');
  }
  return pinia;
};
