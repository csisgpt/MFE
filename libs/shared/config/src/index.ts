export type FeatureFlags = Record<string, boolean>;

export interface RuntimeConfig {
  apiBaseUrl: string;
  hostApiVersion: string;
  featureFlags: FeatureFlags;
  remotePrefixes: {
    appOne: string;
    appTwo: string;
    insurance: string;
    admission: string;
    ops: string;
  };
}

const defaultConfig: RuntimeConfig = {
  apiBaseUrl: '/api',
  hostApiVersion: '1.0.0',
  featureFlags: {
    enableReports: true,
    disableInsurance: false,
    disableAdmission: false,
    disableOps: false
  },
  remotePrefixes: {
    appOne: '/remotes/app-one',
    appTwo: '/remotes/app-two',
    insurance: '/remotes/insurance',
    admission: '/remotes/admission',
    ops: '/remotes/ops'
  }
};

const runtimeKey = '__CSIS_RUNTIME_CONFIG__';
let runtimeConfig: RuntimeConfig = defaultConfig;

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch('/config/runtime.json', { cache: 'no-store' });
    if (!response.ok) {
      runtimeConfig = defaultConfig;
      (globalThis as { [key: string]: RuntimeConfig })[runtimeKey] = runtimeConfig;
      return;
    }
    const data = (await response.json()) as Partial<RuntimeConfig>;
    runtimeConfig = {
      ...defaultConfig,
      ...data,
      featureFlags: { ...defaultConfig.featureFlags, ...data.featureFlags },
      remotePrefixes: { ...defaultConfig.remotePrefixes, ...data.remotePrefixes }
    };
    (globalThis as { [key: string]: RuntimeConfig })[runtimeKey] = runtimeConfig;
  } catch {
    runtimeConfig = defaultConfig;
    (globalThis as { [key: string]: RuntimeConfig })[runtimeKey] = runtimeConfig;
  }
}

export function getConfig(): RuntimeConfig {
  const globalConfig = (globalThis as { [key: string]: RuntimeConfig })[runtimeKey];
  return globalConfig ?? runtimeConfig;
}

export * from './remotes';
export * from './registry';
