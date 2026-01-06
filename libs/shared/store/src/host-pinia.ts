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
    throw new Error('Host Pinia has not been set. Call setHostPinia() in the shell app.');
  }
  return pinia;
};
