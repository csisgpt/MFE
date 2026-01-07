<template>
  <Toast />
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';
import { onMounted, onBeforeUnmount } from 'vue';
import { eventBus } from '@shared/store';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const handler = (payload: { type: 'success' | 'error' | 'info'; message: string }) => {
  const summaryMap = {
    success: 'موفقیت',
    error: 'خطا',
    info: 'اطلاع'
  } as const;
  toast.add({
    severity: payload.type,
    summary: summaryMap[payload.type],
    detail: payload.message,
    life: 3000
  });
};

onMounted(() => {
  eventBus.on('TOAST', handler);
});

onBeforeUnmount(() => {
  eventBus.off('TOAST', handler);
});
</script>
