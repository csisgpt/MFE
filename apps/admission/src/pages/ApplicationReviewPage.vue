<template>
  <UiPage>
    <UiPageHeader title="بازبینی درخواست" subtitle="امتیاز و یادداشت‌ها" />
    <UiSection>
      <UiForm layout="vertical" :model="store.reviewDraft" @finish="submit">
        <UiFormItem label="امتیاز">
          <UiInput v-model:value="store.reviewDraft.score" type="number" />
        </UiFormItem>
        <UiFormItem label="یادداشت‌ها">
          <UiInput v-model:value="store.reviewDraft.notes" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">ذخیره بازبینی</UiButton>
          <UiButton @click="back">بازگشت</UiButton>
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
  eventBus.emit('TOAST', { type: 'success', message: 'بازبینی ذخیره شد' });
  eventBus.emit('AUDIT_LOG', {
    id: `audit_${Date.now()}`,
    level: 'info',
    message: 'بازبینی پذیرش ثبت شد',
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
