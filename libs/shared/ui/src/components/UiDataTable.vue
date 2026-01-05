<template>
  <DataTable :value="value" v-bind="$attrs" stripedRows responsiveLayout="scroll">
    <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" />
    <slot />
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

interface ColumnDef {
  field: string;
  header: string;
}

interface Props {
  value: unknown[];
  columns: ColumnDef[];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const value = props.value;
const columns = props.columns;
</script>
