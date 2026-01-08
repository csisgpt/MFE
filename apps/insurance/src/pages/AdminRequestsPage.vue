<template>
  <PageShell>
    <PageHeader title="درخواست‌های بیمه" subtitle="بررسی و تأیید درخواست‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'مدیریت درخواست‌ها' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid
        :row-data="requests"
        :column-defs="columns"
        :pagination-page-size="6"
        @row-action="handleAction"
        :show-actions="true"
      />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { approveInsuranceRequest, getInsuranceRequests, rejectInsuranceRequest } from '@shared/api-client';
import { eventBus } from '@shared/store';
import type { ColDef } from 'ag-grid-community';

const requests = ref<any[]>([]);
const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه' },
  { field: 'employeeName', headerName: 'کارمند' },
  { field: 'type', headerName: 'نوع' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'amount', headerName: 'مبلغ' }
];

const handleAction = async (payload: { type: 'view' | 'edit' | 'delete'; row: any }) => {
  if (payload.type === 'edit') {
    const updated = await approveInsuranceRequest(payload.row.id);
    requests.value = requests.value.map((item) => (item.id === updated.id ? updated : item));
    eventBus.emit('TOAST', { type: 'success', message: 'درخواست تأیید شد.' });
  }
  if (payload.type === 'delete') {
    const updated = await rejectInsuranceRequest(payload.row.id);
    requests.value = requests.value.map((item) => (item.id === updated.id ? updated : item));
    eventBus.emit('TOAST', { type: 'info', message: 'درخواست رد شد.' });
  }
};

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
</style>
