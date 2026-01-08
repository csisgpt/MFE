<template>
  <nav class="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <component
        :is="item.to ? 'RouterLink' : 'span'"
        :to="item.to"
        class="rounded-md px-2 py-1 transition hover:text-[var(--color-text)]"
      >
        {{ item.label }}
      </component>
      <span v-if="index < items.length - 1" class="text-[var(--color-text-muted)]">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  items: Array<{ label: string; to?: string }>;
}>();
</script>
