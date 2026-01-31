import type { RouteRecordRaw } from 'vue-router';

export const APP_ONE_LOCAL_ROUTES: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },

  {
    path: '/home',
    name: 'app-one.home',
    component: () => import('./pages/DashboardPage.vue'),
    meta: { label: 'نمای کلی', nav: true }
  },
  {
    path: '/users',
    name: 'app-one.users',
    component: () => import('./pages/UsersPage.vue'),
    meta: { label: 'کاربران', nav: true }
  },
  {
    path: '/requests',
    name: 'app-one.requests',
    component: () => import('./pages/RequestsPage.vue'),
    meta: { label: 'درخواست‌ها', nav: true }
  },

  // هرچی خواستی اضافه کن:
  // { path: '/users/:id', name: 'app-one.user.detail', component: () => import('./pages/UserDetailPage.vue') },

  { path: '/:pathMatch(.*)*', redirect: '/home' }
];

export function buildAppOneNav() {
  return APP_ONE_LOCAL_ROUTES
    .filter((r: any) => r?.meta?.nav && r?.meta?.label && r?.name)
    .map((r: any) => ({ name: r.name as string, label: r.meta.label as string }));
}
