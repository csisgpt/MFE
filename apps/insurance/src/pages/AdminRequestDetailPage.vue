<template>
  <UiPage>
    <UiPageHeader title="Request Detail" subtitle="Review and finalize" />
    <UiSection>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <p><strong>ID:</strong> {{ request?.id }}</p>
        <p><strong>Employee:</strong> {{ request?.employeeName }}</p>
        <p><strong>Status:</strong> {{ request?.status }}</p>
        <p><strong>Amount:</strong> {{ request?.amount }}</p>
        <div class="actions">
          <UiButton type="primary" :disabled="!canApprove" @click="approve">Approve</UiButton>
          <UiButton :disabled="!canReject" @click="reject">Reject</UiButton>
          <UiButton @click="emit('back-to-requests')">Back</UiButton>
        </div>
      </div>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { approveInsuranceRequest, getInsuranceRequest, rejectInsuranceRequest } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { can } from '@shared/permissions';

const emit = defineEmits<{ (e: 'back-to-requests'): void }>();

interface Props {
  requestId: string;
}

const props = defineProps<Props>();
const request = ref<{ id: string; employeeName: string; status: string; amount: number } | null>(null);
const loading = ref(false);

const canApprove = computed(() => can('insurance:request:approve'));
const canReject = computed(() => can('insurance:request:reject'));

const fetchRequest = async () => {
  if (!props.requestId) return;
  loading.value = true;
  try {
    request.value = await getInsuranceRequest(props.requestId);
  } finally {
    loading.value = false;
  }
};

const approve = async () => {
  if (!canApprove.value || !props.requestId) return;
  await approveInsuranceRequest(props.requestId);
  eventBus.emit('TOAST', { type: 'success', message: 'Request approved' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'Insurance request approved',
    source: 'insurance-admin',
    timestamp: new Date().toISOString(),
    context: { id: props.requestId }
  });
  fetchRequest();
};

const reject = async () => {
  if (!canReject.value || !props.requestId) return;
  await rejectInsuranceRequest(props.requestId);
  eventBus.emit('TOAST', { type: 'info', message: 'Request rejected' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'Insurance request rejected',
    source: 'insurance-admin',
    timestamp: new Date().toISOString(),
    context: { id: props.requestId }
  });
  fetchRequest();
};

onMounted(fetchRequest);
watch(() => props.requestId, fetchRequest);
</script>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}
</style>
