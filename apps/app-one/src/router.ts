import { createRouter, createWebHistory } from 'vue-router';
import ShellLayout from './App.vue';

// این کامپوننت‌ها از federation می‌آیند
const AppOneMount = () => import('appOne/AppOneMount');
const DashboardPage = () => import('appOne/pages/DashboardPage');
const UsersPage = () => import('appOne/pages/UsersPage');
const RequestsPage = () => import('appOne/pages/RequestsPage');

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ... routeهای خود shell

    {
      path: '/app-one',
      component: AppOneMount,
      children: [
        { path: '', redirect: '/app-one/home' },
        { path: 'home', component: DashboardPage },
        { path: 'users', component: UsersPage },
        { path: 'requests', component: RequestsPage }
      ]
    }
  ]
});
