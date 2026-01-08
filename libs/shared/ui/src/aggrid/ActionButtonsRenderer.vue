<template>
  <div class="actions" role="group" aria-label="عملیات ردیف">
    <button
      class="action-button"
      type="button"
      title="مشاهده"
      aria-label="مشاهده"
      @click="emitAction('view')"
    >
      <UiIcon name="view" :size="16" />
    </button>
    <button
      class="action-button"
      type="button"
      title="ویرایش"
      aria-label="ویرایش"
      @click="emitAction('edit')"
    >
      <UiIcon name="edit" :size="16" />
    </button>
    <button
      class="action-button danger"
      type="button"
      title="حذف"
      aria-label="حذف"
      @click="emitAction('delete')"
    >
      <UiIcon name="delete" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import UiIcon from '../components/UiIcon.vue';

const props = defineProps<{ params?: { data?: unknown; context?: { onRowAction?: Function } } }>();

const emitAction = (type: 'view' | 'edit' | 'delete') => {
  props.params?.context?.onRowAction?.(type, props.params?.data);
};
</script>

<style scoped>
.actions {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-button {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 10px;
  padding: 4px;
  cursor: pointer;
}

.action-button:hover {
  background: var(--color-surface-muted);
}

.action-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.action-button.danger {
  color: var(--color-danger);
  border-color: color-mix(in srgb, var(--color-danger) 40%, var(--color-border));
}
</style>
