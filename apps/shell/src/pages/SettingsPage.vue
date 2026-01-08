<template>
  <PageShell>
    <PageHeader title="تنظیمات" subtitle="ترجیحات شِل و نمایش">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'خانه', to: '/' }, { label: 'تنظیمات' }]" />
      </template>
    </PageHeader>
    <div class="card space-y-4">
      <div class="row">
        <span>پوسته فعلی: {{ themeLabel }}</span>
        <button class="action-button" type="button" @click="toggleTheme">تغییر پوسته</button>
      </div>
      <div class="row">
        <label class="flex flex-col gap-2 text-sm">
          زبان سامانه
          <select v-model="appStore.language" class="input" @change="handleLanguage">
            <option value="fa">فارسی</option>
            <option value="ar">عربی</option>
            <option value="tr">ترکی</option>
          </select>
        </label>
      </div>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { useHostThemeStore, useHostAppStore } from '@shared/store';
import { eventBus } from '@shared/store';
import { computed } from 'vue';

const themeStore = useHostThemeStore();
const appStore = useHostAppStore();
const themeLabel = computed(() => (themeStore.mode === 'dark' ? 'تاریک' : 'روشن'));

const toggleTheme = () => {
  themeStore.toggle();
  eventBus.emit('THEME_CHANGED', { mode: themeStore.mode });
};

const handleLanguage = () => {
  appStore.setLanguage(appStore.language);
};
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.input {
  padding: 8px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}
</style>
