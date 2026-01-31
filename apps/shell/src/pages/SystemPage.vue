<template>
  <PageShell class="py-2">
    <PageHeader title="وضعیت سامانه" subtitle="سلامت و کنترل‌های لحظه‌ای ماژول‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'خانه', to: '/' }, { label: 'پایش سامانه' }]" />
      </template>

      <template #actions>
        <UiSelect placeholder="انتخاب مدل اعتبارسنجی" v-model="validationMode" :options="validationOptions" />
        <!-- <select v-model="validationMode" class="input">
          <option value="light">اعتبارسنجی سبک</option>
          <option value="deep">اعتبارسنجی عمیق</option>
        </select> -->

        <button class="action-button" type="button" @click="validateAll">
          اعتبارسنجی ریموت‌ها
        </button>
      </template>
    </PageHeader>

    <div class="card bg-surface-muted! grow!">
      <MainTable
        v-if="hasRows"
        class="min-h-[300px]"
        :local-data="remoteRows"
        mode="local"
        :row-model-type="'clientSide'"
        title="وضعیت ریموت‌ها"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
      />

      <EmptyState
        v-else
        title="ریموتی برای نمایش وجود ندارد"
        description="اگر انتظار دارید ریموت‌ها نمایش داده شوند، وضعیت store را بررسی کنید."
      />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import { loadRemoteMount, validateRemote } from '../utils/remotes';
import { eventBus } from '@shared/store';
import { MainTable, EmptyState , UiSelect } from '@shared/ui';

type ValidationMode = 'light' | 'deep';

type RemoteMeta = {
  version?: string;
  buildTime?: string;
};

type RemoteRow = {
  name: RemoteKey;
  label: string;
  status: string;
  meta?: RemoteMeta;

  lastLoadedAt?: string;
  lastPrefetchAt?: string;
  prefetched?: boolean;

  lastValidationStatus?: 'ok' | 'failed';
  lastValidationError?: string;
  lastError?: string;

  isDisabled: boolean;
};

const validationOptions = [
  { label: 'اعتبارسنجی سبک', value: "light" },
  { label: 'اعتبارسنجی عمیق', value: "deep" },
];

const statusStore = useRemoteStatusStore();

const remoteRows = computed<RemoteRow[]>(() =>
  Object.values(statusStore.remotes).map((remote: any) => ({
    ...remote,
    isDisabled: statusStore.disabled.has(remote.name)
  }))
);

const hasRows = computed(() => remoteRows.value.length > 0);

const validationMode = ref<ValidationMode>('light');

const retry = async (name: RemoteKey) => {
  await loadRemoteMount(name);
};

const toggle = (name: RemoteKey) => {
  statusStore.toggleDisabled(name);
};

const statusLabel = (status: string, isDisabled: boolean) => {
  if (isDisabled) return 'غیرفعال';
  switch (status) {
    case 'loaded':
      return 'بارگذاری‌شده';
    case 'failed':
      return 'ناموفق';
    case 'loading':
      return 'در حال بارگذاری';
    default:
      return 'نامشخص';
  }
};

const validationLabel = (status: 'ok' | 'failed') => (status === 'ok' ? 'موفق' : 'ناموفق');
const validationModeLabel = (mode: ValidationMode) => (mode === 'deep' ? 'عمیق' : 'سبک');

const formatTimestamp = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('fa-IR');
};

const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  flex: 1,
  autoHeight: true
};

function actionsRenderer(p: ICellRendererParams<RemoteRow>) {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-wrap gap-2';

  const btnRetry = document.createElement('button');
  btnRetry.type = 'button';
  btnRetry.className = 'grid-action';
  btnRetry.textContent = 'تلاش دوباره';
  btnRetry.addEventListener('click', () => {
    const name = p.data?.name;
    if (!name) return;
    (p as any).retry?.(name);
  });

  const btnToggle = document.createElement('button');
  btnToggle.type = 'button';
  btnToggle.className = 'grid-action';
  btnToggle.textContent = p.data?.isDisabled ? 'فعال‌سازی' : 'غیرفعال‌سازی';
  btnToggle.addEventListener('click', () => {
    const name = p.data?.name;
    if (!name) return;
    (p as any).toggle?.(name);
  });

  wrap.appendChild(btnRetry);
  wrap.appendChild(btnToggle);
  return wrap;
}

const columnDefs = shallowRef<ColDef<RemoteRow>[]>([
  { field: 'label', headerName: 'ریموت', minWidth: 180 },

  {
    headerName: 'نسخه',
    colId: 'version',
    minWidth: 120,
    valueGetter: (params) => params.data?.meta?.version ?? 'نامشخص'
  },
  {
    headerName: 'ساخت',
    colId: 'buildTime',
    minWidth: 170,
    valueGetter: (params) => formatTimestamp(params.data?.meta?.buildTime) || 'نامشخص'
  },
  {
    headerName: 'وضعیت',
    colId: 'status',
    minWidth: 140,
    valueGetter: (params) => statusLabel(params.data?.status ?? '', !!params.data?.isDisabled)
  },
  {
    headerName: 'آخرین بارگذاری',
    colId: 'lastLoadedAt',
    minWidth: 180,
    valueGetter: (params) => formatTimestamp(params.data?.lastLoadedAt) || '—'
  },
  {
    headerName: 'پیش‌بارگذاری',
    colId: 'prefetch',
    minWidth: 140,
    valueGetter: (params) =>
      params.data?.prefetched ? formatTimestamp(params.data?.lastPrefetchAt) || '—' : 'خیر'
  },
  {
    headerName: 'اعتبارسنجی',
    colId: 'validation',
    minWidth: 140,
    valueGetter: (params) =>
      params.data?.lastValidationStatus ? validationLabel(params.data.lastValidationStatus) : '—'
  },
  {
    headerName: 'آخرین خطا',
    colId: 'lastError',
    minWidth: 260,
    flex: 2,
    valueGetter: (params) => params.data?.lastValidationError || params.data?.lastError || '—',
    tooltipValueGetter: (params) =>
      params.value && params.value !== '—' ? String(params.value) : ''
  },
  {
    headerName: 'عملیات',
    colId: 'actions',
    minWidth: 220,
    sortable: false,
    filter: false,
    cellRenderer: actionsRenderer as any,
    cellRendererParams: { retry, toggle }
  }
]);

const validateAll = async () => {
  for (const remote of remoteRows.value) {
    if (statusStore.disabled.has(remote.name)) continue;

    try {
      const result = await validateRemote(remote.name, validationMode.value);
      if (!result.ok) {
        throw new Error(result.error || 'اعتبارسنجی ناموفق بود');
      }

      if (result.meta) {
        statusStore.setMeta(remote.name, result.meta as any);
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
