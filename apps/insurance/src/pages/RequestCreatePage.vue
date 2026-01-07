<template>
  <UiPage>
    <UiPageHeader title="ایجاد درخواست" subtitle="ثبت درخواست جدید بیمه" />
    <UiSection>
      <UiForm layout="vertical" :model="store.newRequest" @finish="submit">
        <UiFormItem label="نام کارمند">
          <UiInput v-model:value="store.newRequest.employeeName" placeholder="نام کارمند" />
        </UiFormItem>
        <UiFormItem label="نوع درخواست">
          <UiSelect v-model:value="store.newRequest.type" :options="typeOptions" />
        </UiFormItem>
        <UiFormItem label="مبلغ برآوردی">
          <UiInput v-model:value="store.newRequest.amount" type="number" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">ثبت</UiButton>
          <UiButton @click="navigate('requests')">انصراف</UiButton>
        </div>
      </UiForm>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { createInsuranceRequest } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { useInsuranceStore } from '../stores/insurance.store';

const router = useRouter();
const store = useInsuranceStore();
const typeOptions = [
  { label: 'بیمه جدید', value: 'بیمه جدید' },
  { label: 'به‌روزرسانی پوشش', value: 'به‌روزرسانی پوشش' },
  { label: 'لغو بیمه', value: 'لغو بیمه' }
];

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
.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
