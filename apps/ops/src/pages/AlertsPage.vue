<template>
  <PageShell>
    <PageHeader title="هشدارها" subtitle="هشدارهای عملیاتی و تایید دریافت">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'عملیات' }, { label: 'هشدارها' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid :row-data="alerts" :column-defs="columns" :pagination-page-size="6" />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ackOpsAlert, getOpsAlerts } from '@shared/api-client';
import { eventBus } from '@shared/store';
import type { ColDef } from 'ag-grid-community';

const alerts = ref<any[]>([]);

const AckCell = {
  template: `<button class="grid-action" type="button" @click="handleAck">تایید دریافت</button>`,
  props: ['params'],
  methods: {
    handleAck() {
      this.params?.ack?.(this.params.data.id);
    }
  }
};

const ack = async (id: string) => {
  await ackOpsAlert(id);
  eventBus.emit('TOAST', { type: 'success', message: 'هشدار تایید شد' });
};

const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه' },
  { field: 'message', headerName: 'پیام', flex: 1 },
  { field: 'severity', headerName: 'شدت' },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRenderer: AckCell,
    sortable: false,
    filter: false,
    cellRendererParams: { ack }
  }
];

onMounted(async () => {
  alerts.value = await getOpsAlerts();
});
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

:deep(.grid-action) {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
}
</style>
