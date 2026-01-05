import { getRemoteEntryUrl, type RemoteName } from '@shared/config';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import type { RemoteMeta } from '@shared/contracts';

const inflight = new Map<RemoteName, Promise<void>>();

const nameMap: Record<RemoteKey, RemoteName> = {
  appOne: 'appOne',
  appTwo: 'appTwo',
  insurance: 'insurance',
  admission: 'admission',
  ops: 'ops'
};

export function prefetchRemoteEntry(name: RemoteKey): void {
  const store = useRemoteStatusStore();
  if (store.disabled.has(name)) {
    return;
  }
  const remoteName = nameMap[name];
  if (inflight.has(remoteName)) {
    return;
  }
  const url = getRemoteEntryUrl(remoteName);
  const promise = fetch(url, { cache: 'force-cache' })
    .then(() => {
      store.markPrefetched(name);
    })
    .catch(() => {
      store.markFailed(name, 'Prefetch failed');
    })
    .finally(() => {
      inflight.delete(remoteName);
    }) as Promise<void>;
  inflight.set(remoteName, promise);
}

export async function loadRemoteMount(name: RemoteKey): Promise<void> {
  const store = useRemoteStatusStore();
  if (store.disabled.has(name)) {
    return;
  }
  store.markLoading(name);
  try {
    switch (name) {
      case 'appOne':
        await import('appOne/AppOneMount');
        break;
      case 'appTwo':
        await import('appTwo/AppTwoMount');
        break;
      case 'insurance':
        await import('insurance/InsuranceMount');
        break;
      case 'admission':
        await import('admission/AdmissionMount');
        break;
      case 'ops':
        await import('ops/OpsMount');
        break;
      default:
        break;
    }
    const meta = await loadRemoteMeta(name);
    store.markLoaded(name, meta ?? undefined);
  } catch (error) {
    store.markFailed(name, (error as Error).message || 'Failed to load remote');
  }
}

export async function loadRemoteMeta(name: RemoteKey): Promise<RemoteMeta | null> {
  switch (name) {
    case 'appOne': {
      const mod = await import('appOne/meta');
      return (mod as { remoteMeta: RemoteMeta }).remoteMeta;
    }
    case 'appTwo': {
      const mod = await import('appTwo/meta');
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
