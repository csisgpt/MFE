<template>
  <UiPage>
    <UiPageHeader title="ایجاد گزارش" subtitle="ساخت گزارش عملیاتی جدید" />
    <UiSection>
      <p v-if="!canCreate" class="warning">مجوز ایجاد گزارش را ندارید.</p>
      <UiForm layout="vertical" :model="store.reportDraft" @finish="submit">
        <UiFormItem label="عنوان">
          <UiInput v-model:value="store.reportDraft.title" />
        </UiFormItem>
        <UiFormItem label="توضیحات">
          <UiInput v-model:value="store.reportDraft.description" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit" :disabled="!canCreate">ایجاد</UiButton>
          <UiButton @click="back">انصراف</UiButton>
        </div>
      </UiForm>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { createOpsReport } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { can } from '@shared/permissions';
import { useOpsStore } from '../stores/ops.store';

const router = useRouter();
const store = useOpsStore();

const canCreate = computed(() => can('reports:create'));

const submit = async () => {
  if (!canCreate.value) return;
  await createOpsReport({
    title: store.reportDraft.title,
    status: 'پیش‌نویس',
    createdAt: new Date().toLocaleDateString('fa-IR')
  });
  eventBus.emit('TOAST', { type: 'success', message: 'گزارش ایجاد شد' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'گزارش عملیات ایجاد شد',
    source: 'ops',
    timestamp: new Date().toISOString(),
    context: { title: store.reportDraft.title }
  });
  store.resetReport();
  router.push('/ops/reports');
};

const back = () => {
  router.push('/ops/reports');
};
</script>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.warning {
  color: #dc2626;
}
</style>
