import { getConfig, getRemoteEntryUrl } from '@shared/config';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import type { RemoteMeta } from '@shared/contracts';
import { satisfies } from 'semver';
import { remoteMountLoaders, remoteMetaLoaders } from './remote-import-map.generated';

export type CompatibilityResult = {
  ok: boolean;
  required?: string;
  host?: string;
  reason?: string;
};

export function checkCompatibility(meta?: RemoteMeta | null): CompatibilityResult {
  if (!meta?.requiredHostApi) {
    return { ok: true };
  }
  const { hostApiVersion } = getConfig();
  const ok = satisfies(hostApiVersion, meta.requiredHostApi, { includePrerelease: true });
  if (ok) {
    return { ok, required: meta.requiredHostApi, host: hostApiVersion };
  }
  return {
    ok,
    required: meta.requiredHostApi,
    host: hostApiVersion,
    reason: `نسخه میزبان ${hostApiVersion} با بازه ${meta.requiredHostApi} سازگار نیست`
  };
}

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

    const compatibility = checkCompatibility(meta);
    if (!compatibility.ok) {
      return { ok: false, error: compatibility.reason ?? 'سازگاری نسخه میزبان تایید نشد', meta, compatibility };
    }

    if (mode === 'deep') await importRemoteMount(name);
    return { ok: true, meta, compatibility };
  } catch (error) {
    return { ok: false, error: (error as Error).message || 'اعتبارسنجی ناموفق بود' };
  }
}

function importRemoteMount(name: RemoteKey) {
  const loader = remoteMountLoaders[name];
  if (!loader) return Promise.resolve();
  return loader();
}
