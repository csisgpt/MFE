<template>
  <span class="badge" :data-status="statusLabel">{{ statusLabel }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ params?: { value?: string } }>();

const statusLabel = computed(() => props.params?.value ?? 'نامشخص');
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface), var(--color-primary) 10%);
  color: var(--color-text);
}

.badge[data-status='فعال'],
.badge[data-status='انجام شد'],
.badge[data-status='تایید شده'] {
  background: color-mix(in srgb, var(--color-primary) 18%, var(--color-surface));
  color: var(--color-text);
}

.badge[data-status='در انتظار'],
.badge[data-status='در حال انجام'],
.badge[data-status='در حال بررسی'] {
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
  color: var(--color-text);
}

.badge[data-status='غیرفعال'],
.badge[data-status='تعلیق'],
.badge[data-status='رد شد'],
.badge[data-status='رد شده'] {
  background: color-mix(in srgb, var(--color-border) 60%, var(--color-surface));
  color: var(--color-text-muted);
}
</style>
