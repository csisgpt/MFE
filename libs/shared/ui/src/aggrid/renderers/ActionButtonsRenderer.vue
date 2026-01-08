<template>
  <div class="action-buttons">
    <button
      class="action-btn"
      type="button"
      title="مشاهده"
      aria-label="مشاهده"
      @click="emitAction('view')"
    >
      <UiIcon name="view" />
    </button>
    <button
      class="action-btn"
      type="button"
      title="ویرایش"
      aria-label="ویرایش"
      @click="emitAction('edit')"
    >
      <UiIcon name="edit" />
    </button>
    <button
      class="action-btn action-danger"
      type="button"
      title="حذف"
      aria-label="حذف"
      @click="emitAction('delete')"
    >
      <UiIcon name="delete" />
    </button>
  </div>
</template>

<script setup lang="ts">
import UiIcon from '../../components/UiIcon.vue';

const props = defineProps<{
  params?: {
    data?: unknown;
    context?: {
      onRowAction?: (action: 'view' | 'edit' | 'delete', row: unknown) => void;
    };
  };
}>();

const emitAction = (action: 'view' | 'edit' | 'delete') => {
  props.params?.context?.onRowAction?.(action, props.params?.data);
};
</script>

<style scoped>
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  padding: 4px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.action-btn:hover {
  background: var(--color-surface-muted);
}

.action-danger {
  color: var(--color-danger);
  border-color: var(--color-danger-soft);
}

.action-danger:hover {
  background: var(--color-danger-soft);
}
</style>
