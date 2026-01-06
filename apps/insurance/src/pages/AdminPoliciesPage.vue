<template>
  <UiPage>
    <UiPageHeader title="Policy Admin" subtitle="Manage active policies">
      <template #actions>
        <UiButton type="primary" @click="showModal = true">Add policy</UiButton>
      </template>
    </UiPageHeader>
    <UiSection>
      <UiDataTable :value="policies" :columns="columns" />
    </UiSection>
    <UiModal v-model:open="showModal" title="New policy" @ok="create">
      <div class="form">
        <label>Holder <UiInput v-model:value="store.policyDraft.holder" /></label>
        <label>Plan <UiInput v-model:value="store.policyDraft.plan" /></label>
        <label>Status <UiSelect v-model:value="store.policyDraft.status" :options="statusOptions" /></label>
        <label>Renewal date <UiInput v-model:value="store.policyDraft.renewalDate" /></label>
      </div>
    </UiModal>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { createPolicy, getPolicies } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { useInsuranceStore } from '../stores/insurance.store';

const store = useInsuranceStore();
const policies = ref([]);
const showModal = ref(false);

const columns = [
  { field: 'id', header: 'Policy' },
  { field: 'holder', header: 'Holder' },
  { field: 'plan', header: 'Plan' },
  { field: 'status', header: 'Status' }
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' }
];

const create = async () => {
  const created = await createPolicy(store.policyDraft);
  policies.value = [created, ...policies.value];
  eventBus.emit('TOAST', { type: 'success', message: 'Policy created' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'Policy created',
    source: 'insurance-admin',
    timestamp: new Date().toISOString(),
    context: { id: created.id }
  });
  store.resetPolicy();
  showModal.value = false;
};

onMounted(async () => {
  policies.value = await getPolicies();
});
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
