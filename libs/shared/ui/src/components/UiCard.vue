<template>
  <a-card class="card" v-bind="$attrs">
    <slot />
  </a-card>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>

<style>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}
</style>
