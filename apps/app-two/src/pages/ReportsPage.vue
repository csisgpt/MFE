<template>
  <UiCard>
    <h3>Reports</h3>
    <p v-if="!isAdmin" class="warning">Only admins can submit reports.</p>
    <form class="form" @submit.prevent="submitReport">
      <label>
        Title
        <input v-model="form.title" required />
      </label>
      <label>
        Date Range
        <input v-model="form.dateRange" placeholder="2024-01-01 to 2024-01-31" required />
      </label>
      <label>
        Notes
        <textarea v-model="form.notes" rows="3" />
      </label>
      <UiButton type="primary" html-type="submit" :disabled="!isAdmin">Submit</UiButton>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { createReport } from '@shared/api-client';
import { eventBus, useHostAuthStore } from '@shared/store';

const authStore = useHostAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const form = ref({
  title: '',
  dateRange: '',
  notes: ''
});

const submitReport = async () => {
  if (!isAdmin.value) {
    return;
  }
  try {
    await createReport(form.value);
    eventBus.emit('TOAST', { type: 'success', message: 'Report submitted' });
    form.value = { title: '', dateRange: '', notes: '' };
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
