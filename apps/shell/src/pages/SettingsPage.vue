<template>
  <UiPage>
    <UiPageHeader title="Settings" subtitle="Shell preferences" />
    <UiSection>
      <div class="row">
        <span>Theme: {{ themeStore.mode }}</span>
        <UiButton @click="toggleTheme">Toggle Theme</UiButton>
      </div>
      <div class="row">
        <label>
          Language
          <select v-model="appStore.language" @change="handleLanguage">
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </label>
      </div>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { useHostThemeStore, useHostAppStore } from '@shared/store';
import { eventBus } from '@shared/store';

const themeStore = useHostThemeStore();
const appStore = useHostAppStore();

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
