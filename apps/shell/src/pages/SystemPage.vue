<template>
  <UiPage>
    <UiPageHeader title="System / MFE Status" subtitle="Live module federation health and controls">
      <template #actions>
        <UiSelect v-model:value="validationMode" :options="modeOptions" size="small" />
        <UiButton type="primary" size="small" @click="validateAll">Validate remotes</UiButton>
      </template>
    </UiPageHeader>
    <UiSection title="Remote status" subtitle="Load, disable, and inspect remotes in real time">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Remote</th>
              <th>Version</th>
              <th>Build</th>
              <th>Status</th>
              <th>Last Loaded</th>
              <th>Prefetched</th>
              <th>Validated</th>
              <th>Last Error</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="remote in remoteRows" :key="remote.name">
              <td>{{ remote.label }}</td>
              <td>{{ remote.meta?.version ?? 'N/A' }}</td>
              <td>{{ remote.meta?.buildTime ?? 'N/A' }}</td>
              <td>
                <UiTag :color="statusColor(remote.status)">{{ remote.status }}</UiTag>
              </td>
              <td>{{ remote.lastLoadedAt || '—' }}</td>
              <td>{{ remote.prefetched ? remote.lastPrefetchAt : 'No' }}</td>
              <td>
                <UiTag v-if="remote.lastValidationStatus" :color="validationColor(remote.lastValidationStatus)">
                  {{ remote.lastValidationStatus }}
                </UiTag>
                <span v-else>—</span>
                <div class="validation-time">{{ remote.lastValidatedAt || '' }}</div>
              </td>
              <td>{{ remote.lastValidationError || remote.lastError || '—' }}</td>
              <td>
                <div class="row-actions">
                  <UiButton size="small" @click="retry(remote.name)">Retry load</UiButton>
                  <UiButton size="small" @click="toggle(remote.name)">
                    {{ statusStore.disabled.has(remote.name) ? 'Enable' : 'Disable' }}
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

const validationMode = ref<'light' | 'deep'>('light');
const modeOptions = [
  { label: 'Light validation', value: 'light' },
  { label: 'Deep validation', value: 'deep' }
];

const validateAll = async () => {
  for (const remote of remoteRows.value) {
    if (statusStore.disabled.has(remote.name)) {
      continue;
    }
    try {
      const result = await validateRemote(remote.name, validationMode.value);
      if (!result.ok) {
        throw new Error(result.error || 'Validation failed');
      }
      if (result.meta) {
        statusStore.setMeta(remote.name, result.meta);
      }
      statusStore.markValidated(remote.name, 'ok');
      eventBus.emit('AUDIT_LOG', {
        id: `audit_${Date.now()}_${remote.name}`,
        level: 'info',
        message: `Validated remote ${remote.label} (${validationMode.value})`,
        source: 'system',
        timestamp: new Date().toISOString(),
        context: { remote: remote.name }
      });
    } catch (error) {
      const message = (error as Error).message || 'Validation failed';
      statusStore.markFailed(remote.name, message);
      statusStore.markValidated(remote.name, 'failed', message);
      eventBus.emit('AUDIT_LOG', {
        id: `audit_${Date.now()}_${remote.name}`,
        level: 'error',
        message: `Remote validation failed: ${remote.label}`,
        source: 'system',
        timestamp: new Date().toISOString(),
        context: { remote: remote.name, error: message, mode: validationMode.value }
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
