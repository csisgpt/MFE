<template>
  <UiPage>
    <UiPageHeader title="Workflow Config" subtitle="Configure admission workflow" />
    <UiSection>
      <UiForm layout="vertical" :model="form" @finish="save">
        <UiFormItem label="Workflow">
          <UiInput v-model:value="form.workflow" />
        </UiFormItem>
        <UiFormItem label="Reviewers">
          <UiInput v-model:value="reviewers" placeholder="Comma-separated" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">Save</UiButton>
        </div>
      </UiForm>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getAdmissionConfig, updateAdmissionConfig } from '@shared/api-client';
import { eventBus } from '@shared/store';

const form = ref({ workflow: '', reviewers: [] as string[] });
const reviewers = ref('');

const load = async () => {
  const data = await getAdmissionConfig();
  form.value = data;
  reviewers.value = data.reviewers.join(', ');
};

const save = async () => {
  await updateAdmissionConfig({
    workflow: form.value.workflow,
    reviewers: reviewers.value.split(',').map((item) => item.trim())
  });
  eventBus.emit('TOAST', { type: 'success', message: 'Config updated' });
};

onMounted(load);
</script>

<style scoped>
.actions {
  margin-top: 12px;
}
</style>
