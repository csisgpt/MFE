<template>
  <div
    :class="[
      'animate-pulse rounded-lg bg-[var(--color-border)]/40',
      blockClass
    ]"
    :style="{ height, width }"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    height?: string;
    width?: string;
    blockClass?: string;
  }>(),
  {
    height: '16px',
    width: '100%'
  }
);
</script>
