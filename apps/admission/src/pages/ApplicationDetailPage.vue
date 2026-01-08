<template>
  <PageShell>
    <PageHeader title="جزئیات درخواست" subtitle="زمان‌بندی و پیوست‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'پذیرش' }, { label: 'جزئیات درخواست' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <p v-if="loading">در حال بارگذاری...</p>
      <div v-else>
        <p><strong>شناسه:</strong> {{ record?.id }}</p>
        <p><strong>متقاضی:</strong> {{ record?.applicantName }}</p>
        <p><strong>رشته:</strong> {{ record?.program }}</p>
        <p><strong>وضعیت:</strong> {{ record?.status }}</p>
        <p><strong>تاریخ ثبت:</strong> {{ record?.createdAt }}</p>
      </div>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { getAdmissionApplication } from '@shared/api-client';

interface Props {
  applicationId: string;
}

const props = defineProps<Props>();
const record = ref<any>(null);
const loading = ref(false);

const load = async () => {
  if (!props.applicationId) return;
  loading.value = true;
  try {
    record.value = await getAdmissionApplication(props.applicationId);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
watch(() => props.applicationId, load);
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}
</style>
