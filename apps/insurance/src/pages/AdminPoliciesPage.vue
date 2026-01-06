<template>
  <UiPage>
    <UiPageHeader title="مدیریت بیمه‌نامه‌ها" subtitle="مدیریت بیمه‌نامه‌های فعال">
      <template #actions>
        <UiButton type="primary" @click="showModal = true">افزودن بیمه‌نامه</UiButton>
      </template>
    </UiPageHeader>
    <UiSection>
      <UiDataTable :value="policies" :columns="columns" />
    </UiSection>
    <UiModal v-model:open="showModal" title="بیمه‌نامه جدید" @ok="create">
      <div class="form">
        <label>دارنده <UiInput v-model:value="store.policyDraft.holder" /></label>
        <label>طرح <UiInput v-model:value="store.policyDraft.plan" /></label>
        <label>وضعیت <UiSelect v-model:value="store.policyDraft.status" :options="statusOptions" /></label>
        <label>تاریخ تمدید <UiInput v-model:value="store.policyDraft.renewalDate" /></label>
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
  { field: 'id', header: 'بیمه‌نامه' },
  { field: 'holder', header: 'دارنده' },
  { field: 'plan', header: 'طرح' },
  { field: 'status', header: 'وضعیت' }
];

const statusOptions = [
  { label: 'فعال', value: 'فعال' },
  { label: 'منقضی', value: 'منقضی' }
];

const create = async () => {
  const created = await createPolicy(store.policyDraft);
  policies.value = [created, ...policies.value];
  eventBus.emit('TOAST', { type: 'success', message: 'بیمه‌نامه ایجاد شد' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'بیمه‌نامه ایجاد شد',
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
