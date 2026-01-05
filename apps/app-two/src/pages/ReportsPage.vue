<template>
  <UiCard>
    <h3>Reports</h3>
    <p v-if="!canCreate" class="warning">Only admins can submit reports.</p>
    <form class="form" @submit.prevent="submitReport">
      <label>
        Title
        <input v-model="appTwoStore.reportDraft.title" required />
      </label>
      <label>
        Date Range
        <input
          v-model="appTwoStore.reportDraft.dateRange"
          placeholder="2024-01-01 to 2024-01-31"
          required
        />
      </label>
      <label>
        Notes
        <textarea v-model="appTwoStore.reportDraft.notes" rows="3" />
      </label>
      <UiButton type="primary" html-type="submit" :disabled="!canCreate">Submit</UiButton>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { createReport } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { can } from '@shared/permissions';
import { useAppTwoStore } from '../stores/app-two.store';

const appTwoStore = useAppTwoStore();
const canCreate = computed(() => can('reports:create'));

const submitReport = async () => {
  if (!canCreate.value) {
    return;
  }
  try {
    await createReport(appTwoStore.reportDraft);
    eventBus.emit('TOAST', { type: 'success', message: 'Report submitted' });
    eventBus.emit('AUDIT_LOG', {
      id: `audit_${Date.now()}`,
      level: 'info',
      message: 'Report submitted',
      source: 'app-two',
      timestamp: new Date().toISOString(),
      context: { title: appTwoStore.reportDraft.title }
    });
    appTwoStore.resetReportDraft();
  } catch {
    eventBus.emit('TOAST', { type: 'error', message: 'Report submission failed' });
  }
};
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

input,
textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.warning {
  color: #dc2626;
}
</style>
