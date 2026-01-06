<template>
  <UiCard>
    <div class="header">
      <h3>سفارش‌ها</h3>
      <input v-model="appOneStore.orderQuery" placeholder="جستجو بر اساس شناسه" />
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
  { field: 'id', header: 'شناسه سفارش' },
  { field: 'status', header: 'وضعیت' },
  { field: 'total', header: 'مبلغ کل' }
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
