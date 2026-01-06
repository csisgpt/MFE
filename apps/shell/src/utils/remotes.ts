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

export type RemoteLoadResult = {
  ok: boolean;
  error?: string;
  meta?: RemoteMeta;
};

async function importRemoteMount(name: RemoteKey): Promise<void> {
  switch (name) {
    case 'appOne':
      await import('appOne/AppOneMount');
      return;
    case 'appTwo':
      await import('appTwo/AppTwoMount');
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
    default:
      return;
  }
}

export async function loadRemoteMount(name: RemoteKey): Promise<RemoteLoadResult> {
  const store = useRemoteStatusStore();
  if (store.disabled.has(name)) {
    return { ok: false, error: 'Remote disabled' };
  }
  store.markLoading(name);
  try {
    await importRemoteMount(name);
    const meta = await loadRemoteMeta(name);
    store.markLoaded(name, meta ?? undefined);
    return { ok: true, meta: meta ?? undefined };
  } catch (error) {
    const message = (error as Error).message || 'Failed to load remote';
    store.markFailed(name, message);
    return { ok: false, error: message };
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

export async function validateRemote(
  name: RemoteKey,
  mode: 'light' | 'deep'
): Promise<RemoteLoadResult> {
  try {
    const response = await fetch(getRemoteEntryUrl(nameMap[name]), { cache: 'no-store' });
    if (!response.ok) {
      return { ok: false, error: `remoteEntry ${response.status}` };
    }
    const meta = await loadRemoteMeta(name);
    if (!meta) {
      return { ok: false, error: 'Missing remote metadata' };
    }
    if (mode === 'deep') {
      await importRemoteMount(name);
    }
    return { ok: true, meta };
  } catch (error) {
    return { ok: false, error: (error as Error).message || 'Validation failed' };
  }
}
