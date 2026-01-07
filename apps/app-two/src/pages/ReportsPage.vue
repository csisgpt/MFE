<template>
  <UiCard>
    <h3>گزارش‌ها</h3>
    <p v-if="!canCreate" class="warning">فقط مدیران می‌توانند گزارش ارسال کنند.</p>
    <form class="form" @submit.prevent="submitReport">
      <label>
        عنوان
        <input v-model="appTwoStore.reportDraft.title" required />
      </label>
      <label>
        بازه تاریخ
        <input
          v-model="appTwoStore.reportDraft.dateRange"
          placeholder="۱۴۰۲/۱۰/۱۱ تا ۱۴۰۲/۱۱/۱۱"
          required
        />
      </label>
      <label>
        توضیحات
        <textarea v-model="appTwoStore.reportDraft.notes" rows="3" />
      </label>
      <UiButton type="primary" html-type="submit" :disabled="!canCreate">ثبت</UiButton>
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
    eventBus.emit('TOAST', { type: 'success', message: 'گزارش ثبت شد' });
    eventBus.emit('AUDIT_LOG', {
      id: `audit_${Date.now()}`,
      level: 'info',
      message: 'گزارش ثبت شد',
      source: 'app-two',
      timestamp: new Date().toISOString(),
      context: { title: appTwoStore.reportDraft.title }
    });
    appTwoStore.resetReportDraft();
  } catch {
    eventBus.emit('TOAST', { type: 'error', message: 'ثبت گزارش ناموفق بود' });
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
