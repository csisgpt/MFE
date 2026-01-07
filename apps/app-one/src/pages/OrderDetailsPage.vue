<template>
  <UiCard>
    <h3>جزئیات سفارش</h3>
    <p v-if="loading">در حال بارگذاری...</p>
    <div v-else>
      <p>شناسه: {{ order?.id }}</p>
      <p>وضعیت: {{ order?.status }}</p>
      <p>مبلغ کل: {{ order?.total }} تومان</p>
      <div class="actions">
        <UiButton type="primary" @click="openConfirm">تایید</UiButton>
        <UiButton @click="emitBack">بازگشت به سفارش‌ها</UiButton>
      </div>
    </div>
  </UiCard>
  <UiModal v-model:open="showConfirm" title="تایید سفارش" @ok="handleApprove">
    آیا از تایید این سفارش اطمینان دارید؟
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
    eventBus.emit('TOAST', { type: 'success', message: 'سفارش تایید شد' });
  } catch {
    eventBus.emit('TOAST', { type: 'error', message: 'تایید سفارش ناموفق بود' });
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
