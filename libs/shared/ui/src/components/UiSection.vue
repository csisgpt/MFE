<template>
  <section class="ui-section">
    <header v-if="title" class="section-header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="section-actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<style scoped>
.ui-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
}

.section-header p {
  margin: 4px 0 0;
  color: var(--color-text-muted);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
