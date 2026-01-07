<template>
  <PageShell>
    <PageHeader title="بیمه‌نامه‌ها" subtitle="مدیریت بیمه‌نامه‌های فعال">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'بیمه‌نامه‌ها' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid :row-data="policies" :column-defs="columns" :pagination-page-size="6" />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getPolicies } from '@shared/api-client';
import type { ColDef } from 'ag-grid-community';

const policies = ref([]);
const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه بیمه‌نامه' },
  { field: 'holder', headerName: 'دارنده' },
  { field: 'plan', headerName: 'طرح' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'renewalDate', headerName: 'تاریخ تمدید' }
];

onMounted(async () => {
  policies.value = await getPolicies();
});
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}
</style>
