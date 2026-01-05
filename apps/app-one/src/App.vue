<template>
  <div class="standalone">
    <header class="header">App One Standalone</header>
    <AppOneMount />
  </div>
</template>

<script setup lang="ts">
import AppOneMount from './AppOneMount.vue';
</script>

<style scoped>
.header {
  padding: 12px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}
</style>
