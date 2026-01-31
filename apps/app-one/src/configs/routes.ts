import type { RouteRecordRaw } from 'vue-router';

import DashboardPage from '../pages/DashboardPage.vue';
import UsersPage from '../pages/UsersPage.vue';
import RequestsPage from '../pages/RequestsPage.vue';

export const APP_ONE_BASE_PATH = '/app-one';

export const APP_ONE_ROUTES: RouteRecordRaw[] = [
  { path: '', redirect: `${APP_ONE_BASE_PATH}/home` },

  {
    path: 'home',
    name: 'app-one.home',
    component: DashboardPage,
    meta: { label: 'نمای کلی' }
  },
  {
    path: 'users',
    name: 'app-one.users',
    component: UsersPage,
    meta: { label: 'کاربران' }
  },
  {
    path: 'requests',
    name: 'app-one.requests',
    component: RequestsPage,
    meta: { label: 'درخواست‌ها' }
  }
];

export default APP_ONE_ROUTES;
