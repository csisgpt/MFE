<template>
  <PageShell>
    <PageHeader title="تصمیم نهایی" subtitle="نهایی‌سازی درخواست">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'پذیرش' }, { label: 'تصمیم نهایی' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <UiForm layout="vertical" :model="form" @finish="submit">
        <UiFormItem label="نتیجه">
          <UiSelect v-model:value="form.decision" :options="options" />
        </UiFormItem>
        <UiFormItem label="توضیحات">
          <UiInput v-model:value="form.reason" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">ثبت تصمیم</UiButton>
          <UiButton @click="emit('back')">بازگشت</UiButton>
        </div>
      </UiForm>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { decideAdmissionApplication } from '@shared/api-client';
import { eventBus } from '@shared/store';

const emit = defineEmits<{ (e: 'back'): void }>();

interface Props {
  applicationId: string;
}

const props = defineProps<Props>();
const form = ref({ decision: 'پذیرش', reason: '' });
const options = [
  { label: 'پذیرش', value: 'پذیرش' },
  { label: 'رد', value: 'رد' }
];

const submit = async () => {
  if (!props.applicationId) return;
  await decideAdmissionApplication(props.applicationId, form.value);
  eventBus.emit('TOAST', { type: 'success', message: 'تصمیم ثبت شد' });
  emit('back');
};
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
  margin-top: 12px;
}
</style>
