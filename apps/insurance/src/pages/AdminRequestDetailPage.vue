<template>
  <PageShell>
    <PageHeader title="جزئیات درخواست" subtitle="بررسی و نهایی‌سازی">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'جزئیات درخواست' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <SkeletonBlock v-if="loading" height="120px" />
      <div v-else>
        <p><strong>شناسه:</strong> {{ request?.id }}</p>
        <p><strong>کارمند:</strong> {{ request?.employeeName }}</p>
        <p><strong>وضعیت:</strong> {{ request?.status }}</p>
        <p><strong>مبلغ:</strong> {{ request?.amount }}</p>
        <div class="actions">
          <UiButton type="primary" :disabled="!canApprove" @click="approve">تایید</UiButton>
          <UiButton :disabled="!canReject" @click="reject">رد</UiButton>
          <UiButton @click="emit('back-to-requests')">بازگشت</UiButton>
        </div>
      </div>
    </div>
  </PageShell>
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
  eventBus.emit('TOAST', { type: 'success', message: 'درخواست تایید شد' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'درخواست بیمه تایید شد',
    source: 'insurance-admin',
    timestamp: new Date().toISOString(),
    context: { id: props.requestId }
  });
  fetchRequest();
};

const reject = async () => {
  if (!canReject.value || !props.requestId) return;
  await rejectInsuranceRequest(props.requestId);
  eventBus.emit('TOAST', { type: 'info', message: 'درخواست رد شد' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'درخواست بیمه رد شد',
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
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}
</style>
