<template>
  <UiPage>
    <UiPageHeader title="ثبت خسارت" subtitle="اعلام خسارت جدید" />
    <UiSection>
      <UiForm layout="vertical" :model="store.newClaim" @finish="submit">
        <UiFormItem label="شناسه بیمه‌نامه">
          <UiInput v-model:value="store.newClaim.policyId" />
        </UiFormItem>
        <UiFormItem label="زیان‌دیده">
          <UiInput v-model:value="store.newClaim.claimant" />
        </UiFormItem>
        <UiFormItem label="مبلغ">
          <UiInput v-model:value="store.newClaim.amount" type="number" />
        </UiFormItem>
        <UiFormItem label="ضمیمه">
          <UiInput placeholder="بارگذاری رسید (نمونه)" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">ارسال</UiButton>
          <UiButton @click="navigate('claims')">انصراف</UiButton>
        </div>
      </UiForm>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { createClaim } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { useInsuranceStore } from '../stores/insurance.store';

const router = useRouter();
const store = useInsuranceStore();

const submit = async () => {
  await createClaim(store.newClaim);
  eventBus.emit('TOAST', { type: 'success', message: 'خسارت ثبت شد' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'خسارت بیمه ایجاد شد',
    source: 'insurance',
    timestamp: new Date().toISOString(),
    context: { policyId: store.newClaim.policyId }
  });
  store.resetClaim();
  router.push('/insurance/claims');
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
