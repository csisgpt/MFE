<template>
  <div class="standalone p-4">
    <header class="header">اپلیکیشن دو (حالت مستقل)</header>
    <AppTwoMount />
  </div>
</template>

<script setup lang="ts">
import AppTwoMount from './AppTwoMount.vue';
</script>

<style scoped>
.header {
  padding: 12px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}
</style>
