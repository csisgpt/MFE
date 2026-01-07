<template>
  <div class="standalone">
    <header class="header">پذیرش (حالت مستقل)</header>
    <AdmissionMount />
  </div>
</template>

<script setup lang="ts">
import AdmissionMount from './AdmissionMount.vue';
</script>

<style scoped>
.header {
  padding: 12px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}
</style>
