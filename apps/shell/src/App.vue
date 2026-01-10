<template>
  <AppLayout
    v-if="!isAuthRoute"
    brand="مرکز یکپارچه سازمان"
    :nav-groups="navGroups"
    :user-name="authStore.user?.name || 'کاربر مهمان'"
    :user-role="roleLabel"
    :notifications-count="3"
    :theme-label="themeLabel"
    @toggle-theme="themeStore.toggle"
    @logout="handleLogout"
    @open-profile="handleProfile"
    @prefetch="handlePrefetch"
  >
    <Transition mode="out-in" name="slide-fade">
      <RouterView :key="route.fullPath" />
    </Transition>
    <UiToastHost />
  </AppLayout>
  <div v-else class="min-h-screen bg-[var(--color-surface-muted)]" dir="rtl">
    <RouterView />
    <UiToastHost />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHostAuthStore, useHostThemeStore } from '@shared/store';
import { logout } from '@shared/auth';
import { prefetchRemoteEntry } from './utils/remotes';
import type { RemoteKey } from './stores/remote-status.store';
import { useRoute, useRouter } from 'vue-router';
import { getConfig, getEnabledRemotes } from '@shared/config';

const authStore = useHostAuthStore();
const themeStore = useHostThemeStore();
const route = useRoute();
const router = useRouter();
const enabledRemotes = computed(() => getEnabledRemotes(getConfig()));
const themeLabel = computed(() => (themeStore.mode === 'dark' ? 'حالت تاریک' : 'حالت روشن'));
const roleLabel = computed(() => {
  const role = authStore.user?.role;
  switch (role) {
    case 'admin':
      return 'مدیر سیستم';
    case 'employee':
      return 'کارشناس سازمانی';
    case 'reviewer':
      return 'بازبین ارشد';
    case 'ops':
      return 'عملیات';
    default:
      return 'کاربر سازمانی';
  }
});

const navGroups = computed(() => {
  const remoteIcons: Record<string, 'home' | 'apps' | 'table' | 'users' | 'report'> = {
    appOne: 'apps',
    appTwo: 'apps',
    insurance: 'table',
    admission: 'users',
    ops: 'report'
  };

  return [
    {
      label: 'داشبورد',
      items: [{ label: 'خانه', to: '/', icon: 'home' }]
    },
    {
      label: 'سامانه‌ها',
      items: enabledRemotes.value.map((remote) => ({
        label: remote.titleFa,
        to: remote.basePath,
        icon: remoteIcons[remote.id] ?? 'apps',
        remoteId: remote.id
      }))
    },
    {
      label: 'گزارش‌ها',
      items: [{ label: 'ممیزی', to: '/audit', icon: 'report' }]
    },
    {
      label: 'مدیریت',
      items: [
        { label: 'پیکربندی', to: '/settings', icon: 'settings' },
        { label: 'پروفایل', to: '/profile', icon: 'user' },
        { label: 'پایش سامانه', to: '/system', icon: 'apps' }
      ]
    }
  ];
});

const handleLogout = () => {
  logout();
};

const handleProfile = () => {
  router.push('/profile');
};

const handlePrefetch = (item: { remoteId?: string }) => {
  if (item.remoteId) {
    prefetchRemoteEntry(item.remoteId as RemoteKey);
  }
};

const isAuthRoute = computed(() => route.name === 'login');
</script>

<style>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
