<template>
  <UiPage>
    <UiPageHeader title="Create Request" subtitle="Submit a new insurance request" />
    <UiSection>
      <UiForm layout="vertical" :model="store.newRequest" @finish="submit">
        <UiFormItem label="Employee name">
          <UiInput v-model:value="store.newRequest.employeeName" placeholder="Employee" />
        </UiFormItem>
        <UiFormItem label="Request type">
          <UiSelect v-model:value="store.newRequest.type" :options="typeOptions" />
        </UiFormItem>
        <UiFormItem label="Estimated amount">
          <UiInput v-model:value="store.newRequest.amount" type="number" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">Submit</UiButton>
          <UiButton @click="navigate('requests')">Cancel</UiButton>
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
  { label: 'New Policy', value: 'New Policy' },
  { label: 'Coverage Update', value: 'Coverage Update' },
  { label: 'Cancellation', value: 'Cancellation' }
];

const submit = async () => {
  await createInsuranceRequest(store.newRequest);
  eventBus.emit('TOAST', { type: 'success', message: 'Request submitted' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'Insurance request created',
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
