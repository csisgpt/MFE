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

const REDIRECT_KEY = 'auth-redirect';

const demoUsers = [
  { username: 'مدیر', password: '1234', name: 'الهام اکبری', role: 'admin' as const },
  { username: 'کارشناس', password: '1234', name: 'سامان نیک‌خواه', role: 'employee' as const },
  { username: 'بازبین', password: '1234', name: 'پریا راد', role: 'reviewer' as const },
  { username: 'عملیات', password: '1234', name: 'حامد توکلی', role: 'ops' as const },
  { username: 'کاربر', password: '1234', name: 'نگار صابری', role: 'user' as const }
];

const normalizePassword = (password: string) => password.replace(/۱۲۳۴/g, '1234');

export async function login(username: string, password: string, remember = true) {
  const authStore = useHostAuthStore();
  const normalizedPassword = normalizePassword(password);
  const matched = demoUsers.find((user) => user.username === username && user.password === normalizedPassword);

  if (!matched) {
    throw new Error('نام کاربری یا گذرواژه اشتباه است.');
  }

  authStore.setAuth(`mock-${matched.role}`, {
    id: `user-${matched.role}`,
    name: matched.name,
    role: matched.role
  });

  localStorage.setItem('auth-remember', remember ? 'true' : 'false');
  return matched;
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

export function requireAuth(to: { fullPath: string }) {
  const authStore = useHostAuthStore();
  if (!authStore.isAuthenticated) {
    setRedirectPath(to.fullPath);
    return { path: '/login' };
  }
  return true;
}
