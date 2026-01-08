<template>
  <PageShell>
    <PageHeader title="وضعیت سامانه" subtitle="سلامت و کنترل‌های لحظه‌ای ماژول‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'خانه', to: '/' }, { label: 'پایش سامانه' }]" />
      </template>
      <template #actions>
        <select v-model="validationMode" class="input">
          <option value="light">اعتبارسنجی سبک</option>
          <option value="deep">اعتبارسنجی عمیق</option>
        </select>
        <button class="action-button" type="button" @click="validateAll">اعتبارسنجی ریموت‌ها</button>
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid :row-data="remoteRows" :column-defs="columnDefs" :pagination="false" />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import { loadRemoteMount, validateRemote } from '../utils/remotes';
import { eventBus } from '@shared/store';
import type { ColDef } from 'ag-grid-community';

const statusStore = useRemoteStatusStore();

const remoteRows = computed(() =>
  Object.values(statusStore.remotes).map((remote) => ({
    ...remote,
    isDisabled: statusStore.disabled.has(remote.name)
  }))
);

const retry = async (name: RemoteKey) => {
  await loadRemoteMount(name);
};

const toggle = (name: RemoteKey) => {
  statusStore.toggleDisabled(name);
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'loaded':
      return 'بارگذاری‌شده';
    case 'failed':
      return 'ناموفق';
    case 'loading':
      return 'در حال بارگذاری';
    case 'disabled':
      return 'غیرفعال';
    default:
      return 'نامشخص';
  }
};

const validationLabel = (status: 'ok' | 'failed') => (status === 'ok' ? 'موفق' : 'ناموفق');
const validationModeLabel = (mode: 'light' | 'deep') => (mode === 'deep' ? 'عمیق' : 'سبک');
const formatTimestamp = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('fa-IR');
};

const ActionCell = {
  template: `
    <div class="flex flex-wrap gap-2">
      <button class="grid-action" type="button" @click="handleRetry">تلاش دوباره</button>
      <button class="grid-action" type="button" @click="handleToggle">
        {{ params?.data?.isDisabled ? 'فعال‌سازی' : 'غیرفعال‌سازی' }}
      </button>
    </div>
  `,
  props: ['params'],
  methods: {
    handleRetry() {
      this.params?.retry?.(this.params.data.name);
    },
    handleToggle() {
      this.params?.toggle?.(this.params.data.name);
    }
  }
};

const columnDefs = computed<ColDef[]>(() => [
  { field: 'label', headerName: 'ریموت' },
  { field: 'meta.version', headerName: 'نسخه', valueGetter: (params) => params.data.meta?.version ?? 'نامشخص' },
  {
    field: 'meta.buildTime',
    headerName: 'ساخت',
    valueGetter: (params) => formatTimestamp(params.data.meta?.buildTime) || 'نامشخص'
  },
  { field: 'status', headerName: 'وضعیت', valueGetter: (params) => statusLabel(params.data.status) },
  {
    field: 'lastLoadedAt',
    headerName: 'آخرین بارگذاری',
    valueGetter: (params) => formatTimestamp(params.data.lastLoadedAt) || '—'
  },
  {
    field: 'lastPrefetchAt',
    headerName: 'پیش‌بارگذاری',
    valueGetter: (params) => (params.data.prefetched ? formatTimestamp(params.data.lastPrefetchAt) || '—' : 'خیر')
  },
  {
    field: 'lastValidationStatus',
    headerName: 'اعتبارسنجی',
    valueGetter: (params) =>
      params.data.lastValidationStatus
        ? validationLabel(params.data.lastValidationStatus)
        : '—'
  },
  {
    field: 'lastValidationError',
    headerName: 'آخرین خطا',
    valueGetter: (params) => params.data.lastValidationError || params.data.lastError || '—',
    flex: 1
  },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRenderer: ActionCell,
    sortable: false,
    filter: false,
    minWidth: 200,
    cellRendererParams: {
      retry,
      toggle
    }
  }
]);

const validationMode = ref<'light' | 'deep'>('light');

const validateAll = async () => {
  for (const remote of remoteRows.value) {
    if (statusStore.disabled.has(remote.name)) {
      continue;
    }
    try {
      const result = await validateRemote(remote.name, validationMode.value);
      if (!result.ok) {
        throw new Error(result.error || 'اعتبارسنجی ناموفق بود');
      }
      if (result.meta) {
        statusStore.setMeta(remote.name, result.meta);
      }
      statusStore.markValidated(remote.name, 'ok');
      eventBus.emit('AUDIT_LOG', {
        id: `audit_${Date.now()}_${remote.name}`,
        level: 'info',
        message: `اعتبارسنجی ریموت ${remote.label} (${validationModeLabel(validationMode.value)}) انجام شد`,
        source: 'system',
        timestamp: new Date().toISOString(),
        context: { remote: remote.name }
      });
    } catch (error) {
      const rawMessage = (error as Error).message;
      const message = 'اعتبارسنجی ناموفق بود';
      statusStore.markFailed(remote.name, message);
      statusStore.markValidated(remote.name, 'failed', message);
      eventBus.emit('AUDIT_LOG', {
        id: `audit_${Date.now()}_${remote.name}`,
        level: 'error',
        message: `اعتبارسنجی ریموت ناموفق بود: ${remote.label}`,
        source: 'system',
        timestamp: new Date().toISOString(),
        context: { remote: remote.name, error: rawMessage, mode: validationMode.value }
      });
    }
  }
};
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.input {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
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
