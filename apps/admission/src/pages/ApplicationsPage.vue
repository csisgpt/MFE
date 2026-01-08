<template>
  <PageShell>
    <PageHeader title="درخواست‌های پذیرش" subtitle="وضعیت متقاضیان و امتیازدهی">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'پذیرش' }, { label: 'درخواست‌ها' }]" />
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
import { getAdmissionApplications } from '@shared/api-client';
import type { ColDef } from 'ag-grid-community';

const query = ref('');
const applications = ref([]);

const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه' },
  { field: 'applicantName', headerName: 'نام متقاضی' },
  { field: 'program', headerName: 'رشته' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'createdAt', headerName: 'تاریخ ثبت' }
];

const filtered = computed(() =>
  applications.value.filter((row: any) => row.applicantName?.includes(query.value))
);

onMounted(async () => {
  applications.value = await getAdmissionApplications();
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
