<template>
  <header
    class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-3"
  >
    <div class="flex items-center gap-3">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] lg:hidden"
        type="button"
        @click="$emit('toggle-mobile')"
      >
        <UiIcon name="menu" />
      </button>
      <div class="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <UiIcon name="apps" />
        </div>
        {{ brand }}
      </div>
    </div>

    <div v-if="showSearch" class="hidden flex-1 items-center justify-center lg:flex">
      <div class="flex w-full max-w-xl items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
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

    <div class="flex items-center gap-2">
      <button
        class="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
        type="button"
      >
        <UiIcon name="notifications" />
        <span
          v-if="notificationsCount > 0"
          class="absolute -top-1 -left-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] text-[var(--color-primary-contrast)]"
        >
          {{ notificationsCount }}
        </span>
      </button>
      <button
        class="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)]"
        type="button"
        @click="$emit('toggle-theme')"
      >
        {{ themeLabel }}
      </button>
      <div class="relative">
        <button
          class="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)]"
          type="button"
          @click="toggleMenu"
        >
          <UiIcon name="user" />
          <div class="hidden text-right sm:block">
            <div class="font-semibold">{{ userName }}</div>
            <div class="text-[10px] text-[var(--color-text-muted)]">{{ userRole }}</div>
          </div>
          <UiIcon name="chevronDown" class="text-[var(--color-text-muted)]" />
        </button>
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full z-20 mt-2 min-w-[180px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg"
        >
          <button
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
            type="button"
            @click="$emit('open-profile')"
          >
            <UiIcon name="user" />
            پروفایل
          </button>
          <button
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
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

const menuOpen = ref(false);
const searchTerm = ref('');

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const emitSearch = () => {
  emit('search', searchTerm.value);
};
</script>
