import { REMOTE_REGISTRY, getRemoteEntryUrl } from '@shared/config';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import type { RemoteMeta } from '@shared/contracts';

const remoteImportMap = {
  appOne: {
    mount: () => import('appOne/AppOneMount'),
    meta: () => import('appOne/meta')
  },
  appTwo: {
    mount: () => import('appTwo/AppTwoMount'),
    meta: () => import('appTwo/meta')
  },
  insurance: {
    mount: () => import('insurance/InsuranceMount'),
    meta: () => import('insurance/meta')
  },
  admission: {
    mount: () => import('admission/AdmissionMount'),
    meta: () => import('admission/meta')
  },
  ops: {
    mount: () => import('ops/OpsMount'),
    meta: () => import('ops/meta')
  }
} as const;

const buildLoaders = <T extends keyof (typeof remoteImportMap)[RemoteKey]>(key: T) =>
  REMOTE_REGISTRY.reduce<Record<RemoteKey, () => Promise<unknown>>>(
    (acc, remote) => {
      const entry = remoteImportMap[remote.id]?.[key];
      if (entry) {
        acc[remote.id] = entry;
      }
      return acc;
    },
    {} as Record<RemoteKey, () => Promise<unknown>>
  );

export const remoteMountLoaders = buildLoaders('mount');
export const remoteMetaLoaders = buildLoaders('meta');

const inflight = new Map<RemoteKey, Promise<void>>();

export function prefetchRemoteEntry(name: RemoteKey): void {
  const store = useRemoteStatusStore();
  if (store.disabled.has(name)) return;
  if (inflight.has(name)) return;

  const url = getRemoteEntryUrl(name);
  const p = fetch(url, { cache: 'force-cache' })
    .then(() => store.markPrefetched(name))
    .catch(() => store.markFailed(name, 'پیش‌بارگذاری ناموفق بود'))
    .finally(() => inflight.delete(name)) as Promise<void>;

  inflight.set(name, p);
}

export async function loadRemoteMount(name: RemoteKey): Promise<void> {
  const loader = remoteMountLoaders[name];
  if (!loader) {
    throw new Error('ریموت ناشناخته است');
  }
  await loader();
}

export async function loadRemoteMeta(name: RemoteKey): Promise<RemoteMeta | null> {
  const loader = remoteMetaLoaders[name];
  if (!loader) return null;
  const mod = await loader();
  return (mod as { remoteMeta: RemoteMeta }).remoteMeta;
}

export async function validateRemote(name: RemoteKey, mode: 'light' | 'deep') {
  try {
    const response = await fetch(getRemoteEntryUrl(name), { cache: 'no-store' });
    if (!response.ok) return { ok: false, error: `ورودی ریموت با کد ${response.status}` };

    const meta = await loadRemoteMeta(name);
    if (!meta) return { ok: false, error: 'متادیتای ریموت یافت نشد' };

    if (mode === 'deep') await importRemoteMount(name);
    return { ok: true, meta };
  } catch (error) {
    return { ok: false, error: (error as Error).message || 'اعتبارسنجی ناموفق بود' };
  }
}

function importRemoteMount(name: RemoteKey) {
  const loader = remoteMountLoaders[name];
  if (!loader) return Promise.resolve();
  return loader();
}
