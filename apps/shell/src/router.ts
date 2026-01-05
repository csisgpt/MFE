import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import LoginPage from './pages/LoginPage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import RemoteLoader from './components/RemoteLoader.vue';
import { requireAuth } from '@shared/auth';
import SystemPage from './pages/SystemPage.vue';
import AuditPage from './pages/AuditPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/settings', name: 'settings', component: SettingsPage, beforeEnter: requireAuth },
    { path: '/profile', name: 'profile', component: ProfilePage, beforeEnter: requireAuth },
    { path: '/system', name: 'system', component: SystemPage, beforeEnter: requireAuth },
    { path: '/audit', name: 'audit', component: AuditPage, beforeEnter: requireAuth },
    {
      path: '/app-one/:catchAll(.*)*',
      name: 'app-one',
      component: RemoteLoader,
      props: { remote: 'appOne', title: 'App One' },
      beforeEnter: requireAuth
    },
    {
      path: '/app-two/:catchAll(.*)*',
      name: 'app-two',
      component: RemoteLoader,
      props: { remote: 'appTwo', title: 'App Two' },
      beforeEnter: requireAuth
    },
    {
      path: '/insurance/:catchAll(.*)*',
      name: 'insurance',
      component: RemoteLoader,
      props: { remote: 'insurance', title: 'Insurance' },
      beforeEnter: requireAuth
    },
    {
      path: '/admission/:catchAll(.*)*',
      name: 'admission',
      component: RemoteLoader,
      props: { remote: 'admission', title: 'Admission' },
      beforeEnter: requireAuth
    },
    {
      path: '/ops/:catchAll(.*)*',
      name: 'ops',
      component: RemoteLoader,
      props: { remote: 'ops', title: 'Ops' },
      beforeEnter: requireAuth
    }
  ]
});

export default router;
