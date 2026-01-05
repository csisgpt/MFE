<template>
  <UiPage>
    <UiPageHeader title="Review Application" subtitle="Score and notes" />
    <UiSection>
      <UiForm layout="vertical" :model="store.reviewDraft" @finish="submit">
        <UiFormItem label="Score">
          <UiInput v-model:value="store.reviewDraft.score" type="number" />
        </UiFormItem>
        <UiFormItem label="Notes">
          <UiInput v-model:value="store.reviewDraft.notes" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">Save review</UiButton>
          <UiButton @click="back">Back</UiButton>
        </div>
      </UiForm>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { reviewAdmissionApplication } from '@shared/api-client';
import { eventBus } from '@shared/store';
import { useAdmissionStore } from '../stores/admission.store';

interface Props {
  applicationId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const store = useAdmissionStore();

const submit = async () => {
  await reviewAdmissionApplication(props.applicationId, store.reviewDraft);
  eventBus.emit('TOAST', { type: 'success', message: 'Review saved' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'Admission review submitted',
    source: 'admission',
    timestamp: new Date().toISOString(),
    context: { id: props.applicationId }
  });
  store.resetReview();
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
</style>
