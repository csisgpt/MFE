<template>
  <PageShell>
    <PageHeader title="تحلیل‌ها" subtitle="نمای کلی عملکرد بخش‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'عملیات' }, { label: 'تحلیل‌ها' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid :row-data="rows" :column-defs="columns" :pagination-page-size="6" />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getOpsAnalytics } from '@shared/api-client';
import type { ColDef } from 'ag-grid-community';

const rows = ref([]);
const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه' },
  { field: 'segment', headerName: 'بخش' },
  { field: 'value', headerName: 'مقدار' }
];

onMounted(async () => {
  rows.value = await getOpsAnalytics();
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
