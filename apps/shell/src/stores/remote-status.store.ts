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
  prefetched?: boolean;
  lastValidatedAt?: string;
  lastValidationStatus?: 'ok' | 'failed';
  lastValidationError?: string;
  meta?: RemoteMeta;
};

const storageKey = 'mfe.disabledRemotes';

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
    setMeta(name: RemoteKey, meta: RemoteMeta) {
      const remote = this.remotes[name];
      if (!remote) {
        return;
      }
      remote.meta = meta;
    },
    loadDisabledFromStorage() {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return;
      }
      try {
        const parsed = JSON.parse(stored) as RemoteKey[];
        this.disabled = new Set(parsed);
        Object.keys(this.remotes).forEach((key) => {
          const name = key as RemoteKey;
          this.remotes[name].status = this.disabled.has(name) ? 'disabled' : 'idle';
        });
      } catch {
        localStorage.removeItem(storageKey);
      }
    },
    persistDisabledToStorage() {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(this.disabled)));
    },
    seedFromRuntimeConfig(disabledFlags: Partial<Record<RemoteKey, boolean>>) {
      this.disabled = new Set();
      Object.keys(this.remotes).forEach((key) => {
        const name = key as RemoteKey;
        const disabled = disabledFlags[name];
        if (disabled) {
          this.disabled.add(name);
          this.remotes[name].status = 'disabled';
        } else if (this.remotes[name].status === 'disabled') {
          this.remotes[name].status = 'idle';
        }
      });
    },
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
      remote.prefetched = true;
    },
    markValidated(name: RemoteKey, status: 'ok' | 'failed', error?: string) {
      const remote = this.remotes[name];
      if (!remote) {
        return;
      }
      remote.lastValidatedAt = new Date().toISOString();
      remote.lastValidationStatus = status;
      remote.lastValidationError = error;
    },
    toggleDisabled(name: RemoteKey) {
      if (this.disabled.has(name)) {
        this.disabled.delete(name);
        if (this.remotes[name].status === 'disabled') {
          this.remotes[name].status = 'idle';
        }
        this.persistDisabledToStorage();
        return;
      }
      this.disabled.add(name);
      this.remotes[name].status = 'disabled';
      this.persistDisabledToStorage();
    },
    setDisabled(name: RemoteKey, disabled: boolean) {
      if (disabled) {
        this.disabled.add(name);
        this.remotes[name].status = 'disabled';
        this.persistDisabledToStorage();
        return;
      }
      this.disabled.delete(name);
      if (this.remotes[name].status === 'disabled') {
        this.remotes[name].status = 'idle';
      }
      this.persistDisabledToStorage();
    }
  }
});
