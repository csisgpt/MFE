<template>
  <UiPage>
    <UiPageHeader title="Insurance Requests" subtitle="Track your submitted requests">
      <template #actions>
        <UiButton type="primary" @click="navigate('requests/create')">New request</UiButton>
      </template>
    </UiPageHeader>
    <UiSection title="Requests">
      <div class="filters">
        <UiInput v-model:value="store.requestFilter" placeholder="Filter by status" />
      </div>
      <UiDataTable :value="filtered" :columns="columns" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getInsuranceRequests } from '@shared/api-client';
import { useInsuranceStore } from '../stores/insurance.store';

const router = useRouter();
const store = useInsuranceStore();
const requests = ref<{ id: string; status: string; type: string; amount: number; employeeName: string }[]>(
  []
);

const columns = [
  { field: 'id', header: 'Request ID' },
  { field: 'employeeName', header: 'Employee' },
  { field: 'type', header: 'Type' },
  { field: 'status', header: 'Status' },
  { field: 'amount', header: 'Amount' }
];

const filtered = computed(() =>
  requests.value.filter((item) => item.status.includes(store.requestFilter))
);

const navigate = (target: string) => {
  router.push(`/insurance/${target}`);
};

onMounted(async () => {
  requests.value = await getInsuranceRequests();
});
</script>

<style scoped>
.filters {
  margin-bottom: 12px;
}
</style>
