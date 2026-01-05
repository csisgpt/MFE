<template>
  <UiPage>
    <UiPageHeader title="System / MFE Status" subtitle="Live module federation health and controls" />
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
              <td>{{ remote.lastPrefetchAt || '—' }}</td>
              <td>{{ remote.lastError || '—' }}</td>
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
import { computed } from 'vue';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import { loadRemoteMount } from '../utils/remotes';

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
</script>

<style scoped>
.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
