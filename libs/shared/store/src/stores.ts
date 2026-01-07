import { defineStore } from 'pinia';
import { getHostPinia } from './host-pinia';
import type { AuditEvent } from '@shared/contracts';

export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'employee' | 'reviewer' | 'ops';
}

const storedToken = localStorage.getItem('auth-token') || '';
const storedUser = localStorage.getItem('auth-user');

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: storedToken as string,
    user: storedUser ? (JSON.parse(storedUser) as UserProfile) : null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    setAuth(token: string, user: UserProfile) {
      this.token = token;
      this.user = user;
      localStorage.setItem('auth-token', token);
      localStorage.setItem('auth-user', JSON.stringify(user));
    },
    setRole(role: UserProfile['role']) {
      if (!this.user) {
        return;
      }
      this.user = { ...this.user, role };
      localStorage.setItem('auth-user', JSON.stringify(this.user));
    },
    clearAuth() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
    }
  },
  persist: false
});

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light'
  }),
  actions: {
    setMode(mode: 'light' | 'dark') {
      this.mode = mode;
      localStorage.setItem('theme-mode', mode);
      document.documentElement.setAttribute('data-theme', mode);
    },
    toggle() {
      this.setMode(this.mode === 'light' ? 'dark' : 'light');
    }
  }
});

export const useAppStore = defineStore('app', {
  state: () => ({
    selectedOrg: localStorage.getItem('selected-org') || 'ستاد مرکزی',
    language: localStorage.getItem('language') || 'fa'
  }),
  actions: {
    setSelectedOrg(org: string) {
      this.selectedOrg = org;
      localStorage.setItem('selected-org', org);
    },
    setLanguage(lang: string) {
      this.language = lang;
      localStorage.setItem('language', lang);
    }
  }
});

export const useAuditStore = defineStore('audit', {
  state: () => ({
    entries: [] as AuditEvent[]
  }),
  actions: {
    add(entry: AuditEvent) {
      this.entries = [entry, ...this.entries].slice(0, 200);
    },
    clear() {
      this.entries = [];
    }
  }
});

export const useHostAuthStore = () => useAuthStore(getHostPinia());
export const useHostThemeStore = () => useThemeStore(getHostPinia());
export const useHostAppStore = () => useAppStore(getHostPinia());
export const useHostAuditStore = () => useAuditStore(getHostPinia());
