<template>
  <UiPage>
    <UiPageHeader title="Decision" subtitle="Finalize the application" />
    <UiSection>
      <p v-if="!canDecide" class="warning">You do not have permission to submit decisions.</p>
      <UiForm layout="vertical" :model="store.decisionDraft" @finish="submit">
        <UiFormItem label="Decision">
          <UiSelect v-model:value="store.decisionDraft.decision" :options="decisionOptions" />
        </UiFormItem>
        <UiFormItem label="Reason">
          <UiInput v-model:value="store.decisionDraft.reason" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit" :disabled="!canDecide">Submit decision</UiButton>
          <UiButton @click="back">Back</UiButton>
        </div>
      </UiForm>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { decideAdmissionApplication } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { can } from '@shared/permissions';
import { useAdmissionStore } from '../stores/admission.store';

interface Props {
  applicationId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const store = useAdmissionStore();

const canDecide = computed(() => can('admission:decision'));

const decisionOptions = [
  { label: 'Accept', value: 'accept' },
  { label: 'Reject', value: 'reject' }
];

const submit = async () => {
  if (!canDecide.value) return;
  await decideAdmissionApplication(props.applicationId, store.decisionDraft);
  eventBus.emit('TOAST', { type: 'success', message: 'Decision recorded' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'Admission decision submitted',
    source: 'admission',
    timestamp: new Date().toISOString(),
    context: { id: props.applicationId, decision: store.decisionDraft.decision }
  });
  store.resetDecision();
  router.push(`/admission/applications/${props.applicationId}`);
};

const back = () => {
  router.push(`/admission/applications/${props.applicationId}`);
};
</script>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.warning {
  color: #dc2626;
}
</style>
