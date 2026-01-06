<template>
  <UiPage>
    <UiPageHeader title="Alerts" subtitle="Operational alerts and acknowledgements" />
    <UiSection>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Message</th>
              <th>Severity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in alerts" :key="alert.id">
              <td>{{ alert.id }}</td>
              <td>{{ alert.message }}</td>
              <td>{{ alert.severity }}</td>
              <td><UiButton size="small" @click="ack(alert.id)">Acknowledge</UiButton></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ackOpsAlert, getOpsAlerts } from '@shared/api-client';
import { eventBus } from '@shared/store';

const alerts = ref([]);

const ack = async (id: string) => {
  await ackOpsAlert(id);
  eventBus.emit('TOAST', { type: 'success', message: 'Alert acknowledged' });
};

onMounted(async () => {
  alerts.value = await getOpsAlerts();
});
</script>

<style scoped>
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
