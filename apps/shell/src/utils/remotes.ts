import { getRemoteEntryUrl, type RemoteName } from '@shared/config';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import type { RemoteMeta } from '@shared/contracts';

// ✅ اسم containerهایی که در federation.name ریموت‌هاست
type RemoteContainerName = 'app-one' | 'app-two' | 'insurance' | 'admission' | 'ops';

// ✅ برای fetch کردن remoteEntry باید از RemoteName (camelCase) استفاده کنیم
const configKeyMap: Record<RemoteKey, RemoteName> = {
  appOne: 'appOne',
  appTwo: 'appTwo',
  insurance: 'insurance',
  admission: 'admission',
  ops: 'ops'
};

// ✅ برای import کردن باید از container name (kebab-case) استفاده کنیم
const containerMap: Record<RemoteKey, RemoteContainerName> = {
  appOne: 'app-one',
  appTwo: 'app-two',
  insurance: 'insurance',
  admission: 'admission',
  ops: 'ops'
};

const inflight = new Map<RemoteKey, Promise<void>>();

export function prefetchRemoteEntry(name: RemoteKey): void {
  const store = useRemoteStatusStore();
  if (store.disabled.has(name)) return;
  if (inflight.has(name)) return;

  const url = getRemoteEntryUrl(configKeyMap[name]);
  const p = fetch(url, { cache: 'force-cache' })
    .then(() => store.markPrefetched(name))
    .catch(() => store.markFailed(name, 'Prefetch failed'))
    .finally(() => inflight.delete(name)) as Promise<void>;

  inflight.set(name, p);
}

export async function loadRemoteMount(name: RemoteKey): Promise<void> {
  switch (name) {
    case 'appOne':
      await import('app-one/AppOneMount');
      return;
    case 'appTwo':
      await import('app-two/AppTwoMount');
      return;
    case 'insurance':
      await import('insurance/InsuranceMount');
      return;
    case 'admission':
      await import('admission/AdmissionMount');
      return;
    case 'ops':
      await import('ops/OpsMount');
      return;
  }
}

export async function loadRemoteMeta(name: RemoteKey): Promise<RemoteMeta | null> {
  switch (name) {
    case 'appOne': {
      const mod = await import('app-one/meta');
      return (mod as { remoteMeta: RemoteMeta }).remoteMeta;
    }
    case 'appTwo': {
      const mod = await import('app-two/meta');
      return (mod as { remoteMeta: RemoteMeta }).remoteMeta;
    }
    case 'insurance': {
      const mod = await import('insurance/meta');
      return (mod as { remoteMeta: RemoteMeta }).remoteMeta;
    }
    case 'admission': {
      const mod = await import('admission/meta');
      return (mod as { remoteMeta: RemoteMeta }).remoteMeta;
    }
    case 'ops': {
      const mod = await import('ops/meta');
      return (mod as { remoteMeta: RemoteMeta }).remoteMeta;
    }
    default:
      return null;
  }
}

export async function validateRemote(name: RemoteKey, mode: 'light' | 'deep') {
  try {
    const response = await fetch(getRemoteEntryUrl(configKeyMap[name]), { cache: 'no-store' });
    if (!response.ok) return { ok: false, error: `remoteEntry ${response.status}` };

    const meta = await loadRemoteMeta(name);
    if (!meta) return { ok: false, error: 'Missing remote metadata' };

    if (mode === 'deep') await importRemoteMount(name);
    return { ok: true, meta };
  } catch (error) {
    return { ok: false, error: (error as Error).message || 'Validation failed' };
  }
}
