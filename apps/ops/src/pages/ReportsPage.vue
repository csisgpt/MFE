<template>
  <PageShell>
    <PageHeader title="گزارش‌ها" subtitle="گزارش‌دهی عملیاتی">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'عملیات' }, { label: 'گزارش‌ها' }]" />
      </template>
      <template #actions>
        <button class="action-button" type="button" @click="navigate('reports/create')">ایجاد گزارش</button>
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid :row-data="reports" :column-defs="columns" :pagination-page-size="6" />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getOpsReports } from '@shared/api-client';
import type { ColDef } from 'ag-grid-community';

const router = useRouter();
const reports = ref([]);
const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه' },
  { field: 'title', headerName: 'عنوان' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'createdAt', headerName: 'تاریخ ایجاد' }
];

const navigate = (target: string) => {
  router.push(`/ops/${target}`);
};

onMounted(async () => {
  reports.value = await getOpsReports();
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
