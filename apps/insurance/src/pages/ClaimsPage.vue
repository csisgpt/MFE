<template>
  <PageShell>
    <PageHeader title="خسارت‌ها" subtitle="خسارت‌های ثبت‌شده توسط تیم شما">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'خسارت‌ها' }]" />
      </template>
      <template #actions>
        <button class="action-button" type="button" @click="navigate('claims/create')">خسارت جدید</button>
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid :row-data="claims" :column-defs="columns" :pagination-page-size="6" />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getClaims } from '@shared/api-client';
import type { ColDef } from 'ag-grid-community';

const router = useRouter();
const claims = ref([]);
const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه خسارت' },
  { field: 'policyId', headerName: 'بیمه‌نامه' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'amount', headerName: 'مبلغ' }
];

const navigate = (target: string) => {
  router.push(`/insurance/${target}`);
};

onMounted(async () => {
  claims.value = await getClaims();
});
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}
</style>
