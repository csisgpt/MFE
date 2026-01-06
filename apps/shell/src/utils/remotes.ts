import { REMOTE_REGISTRY, REMOTE_REGISTRY_BY_ID, getRemoteEntryUrl } from '@shared/config';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import type { RemoteMeta } from '@shared/contracts';

const remoteLoaders = REMOTE_REGISTRY.reduce<Record<RemoteKey, () => Promise<unknown>>>(
  (acc, remote) => {
    acc[remote.id] = () => import(/* @vite-ignore */ remote.mountExport);
    return acc;
  },
  {} as Record<RemoteKey, () => Promise<unknown>>
);

const remoteMetaLoaders = REMOTE_REGISTRY.reduce<Record<RemoteKey, () => Promise<unknown>>>(
  (acc, remote) => {
    acc[remote.id] = () => import(/* @vite-ignore */ remote.metaExport);
    return acc;
  },
  {} as Record<RemoteKey, () => Promise<unknown>>
);

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
  const loader = remoteLoaders[name];
  if (loader) {
    await loader();
  }
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
  const remote = REMOTE_REGISTRY_BY_ID.get(name);
  if (!remote) return Promise.resolve();
  return import(/* @vite-ignore */ remote.mountExport);
}
