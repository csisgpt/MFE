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
  toast.add({
    severity: payload.type,
    summary: payload.type.toUpperCase(),
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
