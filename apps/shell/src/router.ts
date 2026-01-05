import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import LoginPage from './pages/LoginPage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import RemoteWrapper from './components/RemoteWrapper.vue';
import { requireAuth } from '@shared/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/settings', name: 'settings', component: SettingsPage, beforeEnter: requireAuth },
    { path: '/profile', name: 'profile', component: ProfilePage, beforeEnter: requireAuth },
    {
      path: '/app-one/:catchAll(.*)*',
      name: 'app-one',
      component: RemoteWrapper,
      props: { remote: 'appOne', title: 'App One' },
      beforeEnter: requireAuth
    },
    {
      path: '/app-two/:catchAll(.*)*',
      name: 'app-two',
      component: RemoteWrapper,
      props: { remote: 'appTwo', title: 'App Two' },
      beforeEnter: requireAuth
    }
  ]
});

export default router;
