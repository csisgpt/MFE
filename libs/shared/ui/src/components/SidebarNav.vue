<template>
  <div class="border border-border">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      @click="$emit('toggle-mobile')"
    ></div>
    <aside
      :class="[
        'fixed inset-y-0 right-0 z-40 flex h-full flex-col gap-4 border-l border-border bg-surface px-3 py-4 transition-all lg:static lg:translate-x-0',
        collapsed ? 'w-20' : 'w-64',
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-2 text-sm font-semibold text-text">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary"
          >
            <UiIcon name="apps" />
          </div>
          <span v-if="!collapsed">{{ brand }}</span>
        </div>
        <button
          class="hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-text lg:flex"
          type="button"
          @click="$emit('toggle-collapse')"
        >
          <UiIcon :name="collapsed ? 'chevronLeft' : 'chevronRight'" />
        </button>
      </div>

      <nav class="flex flex-1 flex-col gap-4 overflow-y-auto">
        <div v-for="group in groups" :key="group.label" class="flex flex-col gap-2">
          <span v-if="!collapsed" class="px-3 text-xs font-semibold text-text-muted">
            {{ group.label }}
          </span>
          <div class="flex flex-col gap-1">
            <RouterLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text transition hover:bg-surface-muted"
              active-class="bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
              @mouseenter="$emit('prefetch', item)"
              @click="mobileOpen ? $emit('toggle-mobile') : null"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-text"
              >
                <UiIcon :name="item.icon" />
              </div>
              <span v-if="!collapsed" class="flex-1">{{ item.label }}</span>
              <span
                v-if="item.badge && !collapsed"
                class="rounded-full bg-primary-soft px-2 py-1 text-[10px] font-semibold text-color-primary"
              >
                {{ item.badge }}
              </span>
            </RouterLink>
          </div>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import UiIcon from './UiIcon.vue';

export type IconName =
  | 'home'
  | 'apps'
  | 'report'
  | 'settings'
  | 'user'
  | 'logout'
  | 'search'
  | 'notifications'
  | 'table'
  | 'add'
  | 'edit'
  | 'delete'
  | 'view'
  | 'menu'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'users'
  | 'requests';

export type NavItem = {
  label: string;
  to: string;
  icon: IconName;
  badge?: string;
  remoteId?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

defineProps<{
  brand: string;
  groups: NavGroup[];
  collapsed: boolean;
  mobileOpen: boolean;
}>();

defineEmits<{
  (e: 'toggle-collapse'): void;
  (e: 'toggle-mobile'): void;
  (e: 'prefetch', item: NavItem): void;
}>();
</script>
