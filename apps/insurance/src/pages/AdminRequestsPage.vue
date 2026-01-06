<template>
  <UiPage>
    <UiPageHeader title="Requests Review" subtitle="Approve or reject requests" />
    <UiSection>
      <UiDataTable :value="requests" :columns="columns" @row-click="handleRowClick" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getInsuranceRequests } from '@shared/api-client';

const emit = defineEmits<{ (e: 'open-request', id: string): void }>();

const requests = ref([]);
const columns = [
  { field: 'id', header: 'Request ID' },
  { field: 'employeeName', header: 'Employee' },
  { field: 'status', header: 'Status' },
  { field: 'amount', header: 'Amount' }
];

const handleRowClick = (event: { data: { id: string } }) => {
  emit('open-request', event.data.id);
};

onMounted(async () => {
  requests.value = await getInsuranceRequests();
});
</script>
