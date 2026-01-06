<template>
  <UiCard>
    <div class="header">
      <h3>Orders</h3>
      <input v-model="appOneStore.orderQuery" placeholder="Search by id" />
    </div>
    <UiDataTable
      :value="filteredOrders"
      :columns="columns"
      @row-click="handleRowClick"
    />
  </UiCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getOrders } from '@shared/api-client';
import { useAppOneStore } from '../stores/app-one.store';

const emit = defineEmits<{ (e: 'open-order', id: string): void }>();

const orders = ref<{ id: string; status: string; total: number }[]>([]);
const appOneStore = useAppOneStore();

const columns = [
  { field: 'id', header: 'Order ID' },
  { field: 'status', header: 'Status' },
  { field: 'total', header: 'Total' }
];

const filteredOrders = computed(() =>
  orders.value.filter((order) => order.id.includes(appOneStore.orderQuery))
);

const handleRowClick = (event: { data: { id: string } }) => {
  emit('open-order', event.data.id);
};

onMounted(async () => {
  orders.value = await getOrders();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

input {
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
</style>
