<template>
  <UiPage>
    <UiPageHeader title="Analytics" subtitle="Segment performance overview" />
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
  { field: 'id', header: 'ID' },
  { field: 'segment', header: 'Segment' },
  { field: 'value', header: 'Value' }
];

onMounted(async () => {
  rows.value = await getOpsAnalytics();
});
</script>
