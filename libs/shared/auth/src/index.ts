import { useHostAuthStore } from '@shared/store';
import { eventBus } from '@shared/store';

export const useAuth = () => {
  const authStore = useHostAuthStore();
  return {
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated
  };
};

export type LoginPayload = {
  username: string;
  role: 'admin' | 'employee' | 'reviewer' | 'ops' | 'user';
  remember?: boolean;
};

const REDIRECT_KEY = 'auth-redirect';

export async function login(payload: LoginPayload) {
  const authStore = useHostAuthStore();
  const normalizedRole =
    payload.role === 'admin' ||
    payload.role === 'employee' ||
    payload.role === 'reviewer' ||
    payload.role === 'ops'
      ? payload.role
      : 'user';

  authStore.setAuth(`mock-${normalizedRole}`, {
    id: 'user-1',
    name: payload.username,
    role: normalizedRole
  });

  localStorage.setItem('auth-remember', payload.remember ? 'true' : 'false');
}

export function logout() {
  const authStore = useHostAuthStore();
  authStore.clearAuth();
  eventBus.emit('AUTH_LOGOUT', undefined);
}

export function setRedirectPath(path: string) {
  localStorage.setItem(REDIRECT_KEY, path);
}

export function getRedirectPath() {
  const stored = localStorage.getItem(REDIRECT_KEY);
  localStorage.removeItem(REDIRECT_KEY);
  return stored;
}
