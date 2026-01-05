import { defineStore } from 'pinia';
import { getHostPinia } from './host-pinia';

export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'user';
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
    selectedOrg: localStorage.getItem('selected-org') || 'Acme HQ',
    language: localStorage.getItem('language') || 'en'
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

export const useHostAuthStore = () => useAuthStore(getHostPinia());
export const useHostThemeStore = () => useThemeStore(getHostPinia());
export const useHostAppStore = () => useAppStore(getHostPinia());
