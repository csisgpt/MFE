<template>
  <PageShell>
    <PageHeader title="ایجاد درخواست" subtitle="ثبت درخواست جدید بیمه">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'ایجاد درخواست' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <UiForm layout="vertical" :model="store.newRequest" @finish="submit">
        <UiFormItem label="کارمند">
          <UiInput v-model:value="store.newRequest.employeeName" />
        </UiFormItem>
        <UiFormItem label="نوع درخواست">
          <UiInput v-model:value="store.newRequest.type" />
        </UiFormItem>
        <UiFormItem label="مبلغ">
          <UiInput v-model:value="store.newRequest.amount" type="number" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">ثبت درخواست</UiButton>
          <UiButton @click="navigate('requests')">انصراف</UiButton>
        </div>
      </UiForm>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { createInsuranceRequest } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { useInsuranceStore } from '../stores/insurance.store';

const router = useRouter();
const store = useInsuranceStore();

const submit = async () => {
  await createInsuranceRequest(store.newRequest);
  eventBus.emit('TOAST', { type: 'success', message: 'درخواست ثبت شد' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'درخواست بیمه ایجاد شد',
    source: 'insurance',
    timestamp: new Date().toISOString(),
    context: { employeeName: store.newRequest.employeeName }
  });
  store.resetRequest();
  router.push('/insurance/requests');
};

const navigate = (target: string) => {
  router.push(`/insurance/${target}`);
};
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
