import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import LoginPage from './pages/LoginPage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import RemoteLoader from './components/RemoteLoader.vue';
import SystemPage from './pages/SystemPage.vue';
import AuditPage from './pages/AuditPage.vue';
import { buildShellRoutes } from '@shared/config';
import { getRedirectPath, setRedirectPath } from '@shared/auth';
import { useHostAuthStore } from '@shared/store';

const remoteRoutes = buildShellRoutes().map((route) => ({
  path: route.path,
  name: route.name,
  component: RemoteLoader,
  props: { remote: route.remoteId },
  meta: { requiresAuth: true }
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
    { path: '/settings', name: 'settings', component: SettingsPage, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfilePage, meta: { requiresAuth: true } },
    { path: '/system', name: 'system', component: SystemPage, meta: { requiresAuth: true } },
    { path: '/audit', name: 'audit', component: AuditPage, meta: { requiresAuth: true } },
    ...remoteRoutes
  ]
});

router.beforeEach((to) => {
  const authStore = useHostAuthStore();
  if (to.meta.public) {
    if (authStore.isAuthenticated && to.name === 'login') {
      const redirect = getRedirectPath();
      return redirect || '/';
    }
    return true;
  }

  if (!authStore.isAuthenticated) {
    setRedirectPath(to.fullPath);
    return { path: '/login' };
  }

  return true;
});

export default router;
