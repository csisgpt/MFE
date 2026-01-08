<template>
  <div class="min-h-screen bg-[var(--color-surface-muted)] text-[var(--color-text)]" dir="rtl">
    <div class="flex min-h-screen flex-row-reverse w-full!">
      <SidebarNav
        :brand="brand"
        :groups="navGroups"
        :collapsed="sidebarCollapsed"
        :mobile-open="mobileOpen"
        @toggle-collapse="toggleCollapsed"
        @toggle-mobile="toggleMobile"
        @prefetch="(item) => $emit('prefetch', item)"
      />
      <div class="w-full flex flex-col">
        <HeaderBar
          :brand="brand"
          :user-name="userName"
          :user-role="userRole"
          :notifications-count="notificationsCount"
          :show-search="showSearch"
          :theme-label="themeLabel"
          @logout="$emit('logout')"
          @open-profile="$emit('open-profile')"
          @toggle-theme="$emit('toggle-theme')"
          @toggle-mobile="toggleMobile"
          @search="(value) => $emit('search', value)"
        />
        <main class="grow! bg-[var(--color-surface-muted)]">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import HeaderBar from './HeaderBar.vue';
import SidebarNav, { type NavGroup, type NavItem } from './SidebarNav.vue';

const props = withDefaults(
  defineProps<{
    brand: string;
    navGroups: NavGroup[];
    userName?: string;
    userRole?: string;
    notificationsCount?: number;
    showSearch?: boolean;
    themeLabel?: string;
  }>(),
  {
    userName: 'کاربر مهمان',
    userRole: 'بدون نقش',
    notificationsCount: 0,
    showSearch: true,
    themeLabel: 'پوسته'
  }
);

defineEmits<{
  (e: 'logout'): void;
  (e: 'open-profile'): void;
  (e: 'toggle-theme'): void;
  (e: 'search', value: string): void;
  (e: 'prefetch', item: NavItem): void;
}>();

const collapsedKey = 'shell-sidebar-collapsed';
const sidebarCollapsed = ref(localStorage.getItem(collapsedKey) === 'true');
const mobileOpen = ref(false);

const toggleCollapsed = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const toggleMobile = () => {
  mobileOpen.value = !mobileOpen.value;
};

watch(sidebarCollapsed, (value) => {
  localStorage.setItem(collapsedKey, value ? 'true' : 'false');
});

const userName = computed(() => props.userName ?? 'کاربر مهمان');
const userRole = computed(() => props.userRole ?? 'بدون نقش');
</script>
