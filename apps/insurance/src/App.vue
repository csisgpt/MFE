<template>
  <div class="standalone">
    <header class="header">بیمه (حالت مستقل)</header>
    <InsuranceMount />
  </div>
</template>

<script setup lang="ts">
import InsuranceMount from './InsuranceMount.vue';
</script>

<style scoped>
.header {
  padding: 12px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}
</style>
