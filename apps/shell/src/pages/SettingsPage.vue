<template>
  <UiPage>
    <UiPageHeader title="تنظیمات" subtitle="ترجیحات شِل" />
    <UiSection>
      <div class="row">
        <span>پوسته: {{ themeLabel }}</span>
        <UiButton @click="toggleTheme">تغییر پوسته</UiButton>
      </div>
      <div class="row">
        <label>
          زبان
          <select v-model="appStore.language" @change="handleLanguage">
            <option value="fa">فارسی</option>
            <option value="en">انگلیسی</option>
            <option value="fr">فرانسوی</option>
            <option value="es">اسپانیایی</option>
          </select>
        </label>
      </div>
    </UiSection>
  </UiPage>
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
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

select {
  padding: 6px;
  border-radius: var(--radius-sm);
}
</style>
