<template>
  <span class="badge" :class="badgeClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  params?: {
    value?: string;
    valueFormatted?: string;
  };
}>();

const label = computed(() => props.params?.valueFormatted ?? props.params?.value ?? '—');

const badgeClass = computed(() => {
  const value = String(label.value);
  const map: Record<string, string> = {
    فعال: 'badge-success',
    'تکمیل‌شده': 'badge-success',
    'تایید شده': 'badge-success',
    پذیرفته‌شده: 'badge-success',
    غیرفعال: 'badge-muted',
    تعلیق: 'badge-danger',
    'لغو شده': 'badge-danger',
    'رد شده': 'badge-danger',
    منقضی: 'badge-danger',
    'در انتظار': 'badge-warning',
    'در حال انجام': 'badge-info',
    بالا: 'badge-danger',
    متوسط: 'badge-warning',
    کم: 'badge-success'
  };

  return map[value] ?? 'badge-neutral';
});
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  white-space: nowrap;
}

.badge-success {
  background: var(--color-success-soft);
  color: var(--color-success);
  border-color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.badge-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.badge-info {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.badge-muted {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.badge-neutral {
  background: var(--color-surface-muted);
  color: var(--color-text);
  border-color: var(--color-border);
}
</style>
