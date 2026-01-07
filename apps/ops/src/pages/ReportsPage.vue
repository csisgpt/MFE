<template>
  <UiPage>
    <UiPageHeader title="گزارش‌ها" subtitle="گزارش‌دهی عملیاتی">
      <template #actions>
        <UiButton type="primary" @click="navigate('reports/create')">ایجاد گزارش</UiButton>
      </template>
    </UiPageHeader>
    <UiSection>
      <UiDataTable :value="reports" :columns="columns" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getOpsReports } from '@shared/api-client';

const router = useRouter();
const reports = ref([]);
const columns = [
  { field: 'id', header: 'شناسه' },
  { field: 'title', header: 'عنوان' },
  { field: 'status', header: 'وضعیت' },
  { field: 'createdAt', header: 'تاریخ ایجاد' }
];

const navigate = (target: string) => {
  router.push(`/ops/${target}`);
};

onMounted(async () => {
  reports.value = await getOpsReports();
});
</script>
