import type { Pinia } from 'pinia';

let hostPinia: Pinia | null = null;

export const setHostPinia = (pinia: Pinia) => {
  hostPinia = pinia;
};

export const getHostPinia = (): Pinia => {
  if (!hostPinia) {
    throw new Error('Host Pinia has not been set. Call setHostPinia() in the shell app.');
  }
  return hostPinia;
};
