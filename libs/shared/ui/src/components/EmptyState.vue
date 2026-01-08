<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-center"
  >
    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
      <UiIcon :name="icon" :size="24" />
    </div>
    <div class="text-base font-semibold text-[var(--color-text)]">{{ title }}</div>
    <p class="text-sm text-[var(--color-text-muted)]">{{ description }}</p>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    icon?:
      | 'home'
      | 'apps'
      | 'report'
      | 'settings'
      | 'user'
      | 'table'
      | 'users'
      | 'requests';
  }>(),
  {
    title: 'اطلاعاتی برای نمایش وجود ندارد',
    description: 'هنوز داده‌ای ثبت نشده است. می‌توانید مورد جدیدی اضافه کنید.',
    icon: 'table'
  }
);
</script>
