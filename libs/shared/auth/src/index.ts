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

export async function login(username: string, _password: string) {
  const authStore = useHostAuthStore();
  authStore.setAuth('mock-token', {
    id: 'user-1',
    name: username,
    role: username === 'admin' ? 'admin' : 'user'
  });
}

export function logout() {
  const authStore = useHostAuthStore();
  authStore.clearAuth();
  eventBus.emit('AUTH_LOGOUT', undefined);
}

export function requireAuth() {
  const authStore = useHostAuthStore();
  if (!authStore.isAuthenticated) {
    return '/login';
  }
  return true;
}
