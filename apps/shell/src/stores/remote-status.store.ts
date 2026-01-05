import { defineStore } from 'pinia';
import type { RemoteMeta } from '@shared/contracts';

export type RemoteKey = 'appOne' | 'appTwo' | 'insurance' | 'admission' | 'ops';

export type RemoteStatus = {
  name: RemoteKey;
  label: string;
  status: 'idle' | 'loading' | 'loaded' | 'failed' | 'disabled';
  lastLoadedAt?: string;
  lastError?: string;
  lastPrefetchAt?: string;
  meta?: RemoteMeta;
};

const defaultRemotes: Record<RemoteKey, RemoteStatus> = {
  appOne: {
    name: 'appOne',
    label: 'App One',
    status: 'idle'
  },
  appTwo: {
    name: 'appTwo',
    label: 'App Two',
    status: 'idle'
  },
  insurance: {
    name: 'insurance',
    label: 'Insurance',
    status: 'idle'
  },
  admission: {
    name: 'admission',
    label: 'Admission',
    status: 'idle'
  },
  ops: {
    name: 'ops',
    label: 'Ops',
    status: 'idle'
  }
};

export const useRemoteStatusStore = defineStore('remoteStatus', {
  state: () => ({
    remotes: { ...defaultRemotes } as Record<RemoteKey, RemoteStatus>,
    disabled: new Set<RemoteKey>()
  }),
  actions: {
    markLoading(name: RemoteKey) {
      const remote = this.remotes[name];
      if (!remote || this.disabled.has(name)) {
        return;
      }
      remote.status = 'loading';
      remote.lastError = undefined;
    },
    markLoaded(name: RemoteKey, meta?: RemoteMeta) {
      const remote = this.remotes[name];
      if (!remote) {
        return;
      }
      remote.status = 'loaded';
      remote.lastLoadedAt = new Date().toISOString();
      remote.meta = meta ?? remote.meta;
    },
    markFailed(name: RemoteKey, error: string) {
      const remote = this.remotes[name];
      if (!remote) {
        return;
      }
      remote.status = 'failed';
      remote.lastError = error;
    },
    markPrefetched(name: RemoteKey) {
      const remote = this.remotes[name];
      if (!remote) {
        return;
      }
      remote.lastPrefetchAt = new Date().toISOString();
    },
    toggleDisabled(name: RemoteKey) {
      if (this.disabled.has(name)) {
        this.disabled.delete(name);
        if (this.remotes[name].status === 'disabled') {
          this.remotes[name].status = 'idle';
        }
        return;
      }
      this.disabled.add(name);
      this.remotes[name].status = 'disabled';
    },
    setDisabled(name: RemoteKey, disabled: boolean) {
      if (disabled) {
        this.disabled.add(name);
        this.remotes[name].status = 'disabled';
        return;
      }
      this.disabled.delete(name);
      if (this.remotes[name].status === 'disabled') {
        this.remotes[name].status = 'idle';
      }
    }
  }
});
