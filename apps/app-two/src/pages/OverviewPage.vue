<template>
  <div class="grid">
    <UiCard>
      <h3>نمای کلی</h3>
      <p>کاربران فعال: {{ stats.activeUsers }}</p>
      <p>گزارش‌های تولیدشده: {{ stats.reports }}</p>
      <UiButton @click="toggleTheme">تغییر پوسته سراسری</UiButton>
    </UiCard>
    <UiCard>
      <h3>دسترسی سریع</h3>
      <UiButton type="primary" @click="emit('open-users')">مدیریت کاربران</UiButton>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHostThemeStore } from '@shared/store';
import { eventBus } from '@shared/store';

const emit = defineEmits<{ (e: 'open-users'): void }>();
const themeStore = useHostThemeStore();
const stats = ref({ activeUsers: 42, reports: 7 });

const toggleTheme = () => {
  themeStore.toggle();
  eventBus.emit('THEME_CHANGED', { mode: themeStore.mode });
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
</style>
