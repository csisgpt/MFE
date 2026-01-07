import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import LoginPage from './pages/LoginPage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import RemoteLoader from './components/RemoteLoader.vue';
import { requireAuth } from '@shared/auth';
import SystemPage from './pages/SystemPage.vue';
import AuditPage from './pages/AuditPage.vue';
import { buildShellRoutes } from '@shared/config';

const remoteRoutes = buildShellRoutes().map((route) => ({
  path: route.path,
  name: route.name,
  component: RemoteLoader,
  props: { remote: route.remoteId },
  beforeEnter: requireAuth
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/settings', name: 'settings', component: SettingsPage, beforeEnter: requireAuth },
    { path: '/profile', name: 'profile', component: ProfilePage, beforeEnter: requireAuth },
    { path: '/system', name: 'system', component: SystemPage, beforeEnter: requireAuth },
    { path: '/audit', name: 'audit', component: AuditPage, beforeEnter: requireAuth },
    ...remoteRoutes
  ]
});

export default router;
