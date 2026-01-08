<template>
  <nav class="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
    <template v-for="(item, index) in resolvedItems" :key="`${item.label}-${index}`">
      <component
        :is="item.to ? 'RouterLink' : 'span'"
        :to="item.to"
        class="rounded-md px-2 py-1 transition hover:text-[var(--color-text)]"
      >
        {{ item.label }}
      </component>
      <span v-if="index < resolvedItems.length - 1" class="text-[var(--color-text-muted)]">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { computed } from 'vue';

const props = defineProps<{
  items?: Array<{ label: string; to?: string }>;
}>();

const route = useRoute();

const resolvedItems = computed(() => {
  if (props.items?.length) {
    return props.items;
  }
  return route.matched.map((record) => {
    const label =
      record.meta?.breadcrumb ??
      record.meta?.titleFa ??
      record.meta?.title ??
      'مسیر';
    return {
      label: String(label),
      to: record.path || undefined
    };
  });
});
</script>
