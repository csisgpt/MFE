<template>
  <div class="flex flex-col gap-4 border-b border-border pb-4">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold text-text">{{ title }}</h1>
        <p v-if="subtitle" class="-mt-2! mb-0! text-xs text-text-muted">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <slot name="breadcrumbs" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>
