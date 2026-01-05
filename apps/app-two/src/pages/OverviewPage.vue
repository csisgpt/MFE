<template>
  <div class="grid">
    <UiCard>
      <h3>Overview</h3>
      <p>Active users: {{ stats.activeUsers }}</p>
      <p>Reports generated: {{ stats.reports }}</p>
      <UiButton @click="toggleTheme">Toggle Global Theme</UiButton>
    </UiCard>
    <UiCard>
      <h3>Quick Links</h3>
      <UiButton type="primary" @click="emit('open-users')">Manage Users</UiButton>
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
