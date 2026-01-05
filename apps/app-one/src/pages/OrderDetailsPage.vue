<template>
  <UiCard>
    <h3>Order Details</h3>
    <p v-if="loading">Loading...</p>
    <div v-else>
      <p>ID: {{ order?.id }}</p>
      <p>Status: {{ order?.status }}</p>
      <p>Total: ${{ order?.total }}</p>
      <div class="actions">
        <UiButton type="primary" @click="openConfirm">Approve</UiButton>
        <UiButton @click="emitBack">Back to orders</UiButton>
      </div>
    </div>
  </UiCard>
  <UiModal v-model:open="showConfirm" title="Approve order" @ok="handleApprove">
    Are you sure you want to approve this order?
  </UiModal>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { approveOrder, getOrder } from '@shared/api-client';
import { eventBus } from '@shared/store';

interface Props {
  orderId: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'back-to-orders'): void }>();
const order = ref<{ id: string; status: string; total: number } | null>(null);
const loading = ref(false);
const showConfirm = ref(false);

const fetchOrder = async () => {
  if (!props.orderId) {
    return;
  }
  loading.value = true;
  try {
    order.value = await getOrder(props.orderId);
  } finally {
    loading.value = false;
  }
};

const openConfirm = () => {
  showConfirm.value = true;
};

const emitBack = () => {
  emit('back-to-orders');
};

const handleApprove = async () => {
  showConfirm.value = false;
  try {
    await approveOrder(props.orderId);
    eventBus.emit('TOAST', { type: 'success', message: 'Order approved' });
  } catch {
    eventBus.emit('TOAST', { type: 'error', message: 'Approval failed' });
  }
};

onMounted(fetchOrder);
watch(() => props.orderId, fetchOrder);
</script>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
