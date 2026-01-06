<template>
  <UiPage>
    <UiPageHeader title="Audit" subtitle="Request, event, and error history" />
    <UiSection title="Filters">
      <div class="filters">
        <UiInput v-model:value="search" placeholder="Search message or source" />
        <UiSelect v-model:value="level" :options="levelOptions" placeholder="Level" />
        <UiButton size="small" @click="auditStore.clear">Clear</UiButton>
      </div>
    </UiSection>
    <UiSection title="Entries">
      <UiDataTable :value="filteredEntries" :columns="columns" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useHostAuditStore } from '@shared/store';

const auditStore = useHostAuditStore();
const search = ref('');
const level = ref('all');

const levelOptions = [
  { label: 'All levels', value: 'all' },
  { label: 'Info', value: 'info' },
  { label: 'Error', value: 'error' }
];

const columns = [
  { field: 'timestamp', header: 'Timestamp' },
  { field: 'level', header: 'Level' },
  { field: 'source', header: 'Source' },
  { field: 'message', header: 'Message' }
];

const filteredEntries = computed(() =>
  auditStore.entries.filter((entry) => {
    const matchesLevel = level.value === 'all' || entry.level === level.value;
    const matchesSearch =
      entry.message.toLowerCase().includes(search.value.toLowerCase()) ||
      entry.source.toLowerCase().includes(search.value.toLowerCase());
    return matchesLevel && matchesSearch;
  })
);
</script>

<style scoped>
.filters {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
</style>
