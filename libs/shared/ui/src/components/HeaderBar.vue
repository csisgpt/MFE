<template>
  <header
    class="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-3"
  >
    <div class="flex items-center gap-3 min-w-[20%]">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text lg:hidden"
        type="button"
        @click="$emit('toggle-mobile')"
      >
        <UiIcon name="menu" />
      </button>
      <div class="flex items-center gap-2 text-sm font-semibold text-text">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary"
        >
          <UiIcon name="apps" />
        </div>
        {{ brand }}
      </div>
    </div>

    <div v-if="showSearch" class="hidden flex-1 items-center justify-center lg:flex">
      <div
        class="flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2"
      >
        <UiIcon name="search" class="text-muted" />
        <input
          v-model="searchTerm"
          class="w-full bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
          type="text"
          placeholder="جستجو در سامانه"
          @keyup.enter="emitSearch"
        />
      </div>
    </div>

    <div class="flex items-stretch gap-2 h-10 pl-4 *:cursor-pointer *:hover:scale-110 *:transition-all *:">
      <button
        class="relative h-full aspect-square! flex items-center justify-center rounded-lg border border-border bg-surface text-text"
        type="button"
      >
        <UiIcon :size="20" :stroke-width="2.5" name="notifications" />
        <span
          v-if="notificationsCount > 0"
          class="absolute -top-1 -left-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-contrast"
        >
          {{ notificationsCount }}
        </span>
      </button>
      <div
        class="flex items-center justify-center gap-1 rounded-lg border border-border bg-surface text-xs text-text aspect-square! h-full"
        type="button"
        @click="$emit('toggle-theme')"
      >
        <UiIcon
          :size="20"
          :stroke-width="2.5"
          :class="[themeStore.mode == 'dark' ? 'stroke-yellow-300' : 'stroke-sky-700']"
          :name="themeStore.mode == 'dark' ? 'sun' : 'moon'"
        />
        <!-- {{ themeStore.mode }} - 
        {{ themeLabel }} -->
      </div>
      <div class="relative">
        <div
          class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs text-text  h-full"
          type="button"
          @click="toggleMenu"
        >
          <UiIcon name="user" />
          <div class="hidden text-right sm:block">
            <div class="font-medium text-sm leading-5">{{ userName }}</div>
            <div class="text-[10px] text-text-muted">{{ userRole }}</div>
          </div>
          <UiIcon name="chevronDown" class="text-text-muted" />
        </div>
        <div
          v-if="menuOpen"
          class="absolute left-0 top-full z-20 mt-2 min-w-[180px] rounded-xl border border-border bg-surface p-2 shadow-lg"
        >
          <button
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-muted"
            type="button"
            @click="$emit('open-profile')"
          >
            <UiIcon name="user" />
            پروفایل
          </button>
          <button
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-muted"
            type="button"
            @click="$emit('logout')"
          >
            <UiIcon name="logout" />
            خروج
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSearch" class="w-full lg:hidden">
      <div class="flex w-full items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
        <UiIcon name="search" class="text-[var(--color-text-muted)]" />
        <input
          v-model="searchTerm"
          class="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
          type="text"
          placeholder="جستجو در سامانه"
          @keyup.enter="emitSearch"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UiIcon from './UiIcon.vue';
import { useHostAuthStore, useHostThemeStore } from '@shared/store';

withDefaults(
  defineProps<{
    brand: string;
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

const emit = defineEmits<{
  (e: 'logout'): void;
  (e: 'open-profile'): void;
  (e: 'toggle-theme'): void;
  (e: 'toggle-mobile'): void;
  (e: 'search', value: string): void;
}>();

const themeStore = useHostThemeStore();

const menuOpen = ref(false);
const searchTerm = ref('');

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const emitSearch = () => {
  emit('search', searchTerm.value);
};
</script>
