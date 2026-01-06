<template>
  <UiPage>
    <UiPageHeader title="Create Claim" subtitle="Report a new claim" />
    <UiSection>
      <UiForm layout="vertical" :model="store.newClaim" @finish="submit">
        <UiFormItem label="Policy ID">
          <UiInput v-model:value="store.newClaim.policyId" />
        </UiFormItem>
        <UiFormItem label="Claimant">
          <UiInput v-model:value="store.newClaim.claimant" />
        </UiFormItem>
        <UiFormItem label="Amount">
          <UiInput v-model:value="store.newClaim.amount" type="number" />
        </UiFormItem>
        <UiFormItem label="Attachment">
          <UiInput placeholder="Upload receipt (mock)" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">Submit</UiButton>
          <UiButton @click="navigate('claims')">Cancel</UiButton>
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
  eventBus.emit('TOAST', { type: 'success', message: 'Claim submitted' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'Insurance claim created',
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
