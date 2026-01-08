<template>
  <PageShell>
    <PageHeader title="درخواست‌های بیمه" subtitle="ثبت و پیگیری درخواست‌های بیمه">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'درخواست‌ها' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <div class="filters">
        <input v-model="query" class="input" placeholder="جستجو بر اساس نام" />
      </div>
      <EnterpriseDataGrid :row-data="filtered" :column-defs="columns" :pagination-page-size="6" />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getInsuranceRequests } from '@shared/api-client';
import type { ColDef } from 'ag-grid-community';

const query = ref('');
const requests = ref([]);

const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه' },
  { field: 'employeeName', headerName: 'کارمند' },
  { field: 'type', headerName: 'نوع' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'amount', headerName: 'مبلغ' }
];

const filtered = computed(() =>
  requests.value.filter((row: any) => row.employeeName?.includes(query.value))
);

onMounted(async () => {
  requests.value = await getInsuranceRequests();
});
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.filters {
  margin-bottom: 12px;
}

.input {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  width: 100%;
}
</style>
