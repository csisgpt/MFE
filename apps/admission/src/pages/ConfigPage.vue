<template>
  <PageShell>
    <PageHeader title="پیکربندی گردش کار" subtitle="تنظیم گردش کار پذیرش">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'پذیرش' }, { label: 'پیکربندی' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <UiForm layout="vertical" :model="form" @finish="save">
        <UiFormItem label="گردش کار">
          <UiInput v-model:value="form.workflow" />
        </UiFormItem>
        <UiFormItem label="بازبین‌ها">
          <UiInput v-model:value="reviewers" placeholder="با ویرگول جدا کنید" />
        </UiFormItem>
        <div class="actions">
          <UiButton type="primary" html-type="submit">ذخیره</UiButton>
        </div>
      </UiForm>
    </div>
  </PageShell>
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
  eventBus.emit('TOAST', { type: 'success', message: 'پیکربندی به‌روزرسانی شد' });
};

onMounted(load);
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.actions {
  margin-top: 12px;
}
</style>
