<template>
  <PageShell>
    <PageHeader title="بازبینی درخواست" subtitle="امتیاز و یادداشت‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'پذیرش' }, { label: 'بازبینی' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <UiForm layout="vertical" :model="form" @finish="submit">
        <UiFormItem label="امتیاز">
          <UiInput v-model:value="form.score" type="number" />
        </UiFormItem>
        <UiFormItem label="یادداشت‌ها">
          <UiInput v-model:value="form.notes" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">ثبت بازبینی</UiButton>
          <UiButton @click="emit('back')">بازگشت</UiButton>
        </div>
      </UiForm>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { reviewAdmissionApplication } from '@shared/api-client';
import { eventBus } from '@shared/store';

const emit = defineEmits<{ (e: 'back'): void }>();

interface Props {
  applicationId: string;
}

const props = defineProps<Props>();
const form = ref({ score: 75, notes: '' });

const submit = async () => {
  if (!props.applicationId) return;
  await reviewAdmissionApplication(props.applicationId, form.value);
  eventBus.emit('TOAST', { type: 'success', message: 'بازبینی ثبت شد' });
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
