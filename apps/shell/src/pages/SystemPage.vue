<template>
  <UiPage>
    <UiPageHeader title="وضعیت سامانه" subtitle="سلامت و کنترل‌های لحظه‌ای ماژول‌ها">
      <template #actions>
        <UiSelect v-model:value="validationMode" :options="modeOptions" size="small" />
        <UiButton type="primary" size="small" @click="validateAll">اعتبارسنجی ریموت‌ها</UiButton>
      </template>
    </UiPageHeader>
    <UiSection title="وضعیت ریموت‌ها" subtitle="بارگذاری، غیرفعال‌سازی و بررسی ریموت‌ها در لحظه">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ریموت</th>
              <th>نسخه</th>
              <th>ساخت</th>
              <th>وضعیت</th>
              <th>آخرین بارگذاری</th>
              <th>پیش‌بارگذاری</th>
              <th>اعتبارسنجی</th>
              <th>آخرین خطا</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="remote in remoteRows" :key="remote.name">
              <td>{{ remote.label }}</td>
              <td>{{ remote.meta?.version ?? 'نامشخص' }}</td>
              <td>{{ formatTimestamp(remote.meta?.buildTime) || 'نامشخص' }}</td>
              <td>
                <UiTag :color="statusColor(remote.status)">{{ statusLabel(remote.status) }}</UiTag>
              </td>
              <td>{{ formatTimestamp(remote.lastLoadedAt) || '—' }}</td>
              <td>{{ remote.prefetched ? formatTimestamp(remote.lastPrefetchAt) || '—' : 'خیر' }}</td>
              <td>
                <UiTag v-if="remote.lastValidationStatus" :color="validationColor(remote.lastValidationStatus)">
                  {{ validationLabel(remote.lastValidationStatus) }}
                </UiTag>
                <span v-else>—</span>
                <div class="validation-time">{{ formatTimestamp(remote.lastValidatedAt) }}</div>
              </td>
              <td>{{ remote.lastValidationError || remote.lastError || '—' }}</td>
              <td>
                <div class="row-actions">
                  <UiButton size="small" @click="retry(remote.name)">تلاش دوباره</UiButton>
                  <UiButton size="small" @click="toggle(remote.name)">
                    {{ statusStore.disabled.has(remote.name) ? 'فعال‌سازی' : 'غیرفعال‌سازی' }}
                  </UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import { loadRemoteMount, validateRemote } from '../utils/remotes';
import { eventBus } from '@shared/store';

const statusStore = useRemoteStatusStore();

const remoteRows = computed(() => Object.values(statusStore.remotes));

const retry = async (name: RemoteKey) => {
  await loadRemoteMount(name);
};

const toggle = (name: RemoteKey) => {
  statusStore.toggleDisabled(name);
};

const statusColor = (status: string) => {
  switch (status) {
    case 'loaded':
      return 'green';
    case 'failed':
      return 'red';
    case 'loading':
      return 'blue';
    case 'disabled':
      return 'orange';
    default:
      return 'default';
  }
};

const validationColor = (status: 'ok' | 'failed') => (status === 'ok' ? 'green' : 'red');
const validationLabel = (status: 'ok' | 'failed') => (status === 'ok' ? 'موفق' : 'ناموفق');
const validationModeLabel = (mode: 'light' | 'deep') => (mode === 'deep' ? 'عمیق' : 'سبک');
const formatTimestamp = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('fa-IR');
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

const validationMode = ref<'light' | 'deep'>('light');
const modeOptions = [
  { label: 'اعتبارسنجی سبک', value: 'light' },
  { label: 'اعتبارسنجی عمیق', value: 'deep' }
];

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
.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.validation-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid var(--color-border);
}
</style>
