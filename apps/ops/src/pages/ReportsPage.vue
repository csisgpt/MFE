<template>
  <UiPage>
    <UiPageHeader title="Reports" subtitle="Operational reporting">
      <template #actions>
        <UiButton type="primary" @click="navigate('reports/create')">Create report</UiButton>
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
  { field: 'id', header: 'ID' },
  { field: 'title', header: 'Title' },
  { field: 'status', header: 'Status' },
  { field: 'createdAt', header: 'Created' }
];

const navigate = (target: string) => {
  router.push(`/ops/${target}`);
};

onMounted(async () => {
  reports.value = await getOpsReports();
});
</script>
