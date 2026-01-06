<template>
  <UiPage>
    <UiPageHeader title="تحلیل‌ها" subtitle="نمای کلی عملکرد بخش‌ها" />
    <UiSection>
      <UiDataTable :value="rows" :columns="columns" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getOpsAnalytics } from '@shared/api-client';

const rows = ref([]);
const columns = [
  { field: 'id', header: 'شناسه' },
  { field: 'segment', header: 'بخش' },
  { field: 'value', header: 'مقدار' }
];

onMounted(async () => {
  rows.value = await getOpsAnalytics();
});
</script>
