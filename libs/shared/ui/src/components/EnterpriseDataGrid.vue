<template>
  <div class="w-full">
    <div class="ag-theme-quartz w-full" :style="{ minHeight }">
      <AgGridVue
        :column-defs="resolvedColumnDefs"
        :row-data="rowData"
        :default-col-def="defaultColDef"
        :locale-text="localeText"
        :pagination="pagination"
        :pagination-page-size="paginationPageSize"
        :enable-rtl="true"
        :dom-layout="domLayout"
        :context="{ onRowAction }"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { computed, ref, watch } from 'vue';

const ActionCell = {
  template: `
    <div class="flex items-center justify-center gap-1">
      <button class="action-btn" type="button" @click="emitAction('view')">مشاهده</button>
      <button class="action-btn" type="button" @click="emitAction('edit')">ویرایش</button>
      <button class="action-btn action-danger" type="button" @click="emitAction('delete')">حذف</button>
    </div>
  `,
  props: ['params'],
  methods: {
    emitAction(action: 'view' | 'edit' | 'delete') {
      this.params?.context?.onRowAction?.(action, this.params.data);
    }
  }
};

const props = withDefaults(
  defineProps<{
    rowData: unknown[];
    columnDefs: ColDef[];
    loading?: boolean;
    pagination?: boolean;
    paginationPageSize?: number;
    minHeight?: string;
    domLayout?: 'autoHeight' | 'normal' | 'print';
    showActions?: boolean;
  }>(),
  {
    loading: false,
    pagination: true,
    paginationPageSize: 8,
    minHeight: '320px',
    domLayout: 'autoHeight',
    showActions: false
  }
);

const onRowAction = (action: 'view' | 'edit' | 'delete', row: unknown) => {
  emit('row-action', { action, row });
};

const emit = defineEmits<{
  (e: 'row-action', payload: { action: 'view' | 'edit' | 'delete'; row: unknown }): void;
}>();

const gridApi = ref<GridReadyEvent['api'] | null>(null);

const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: true
};

const localeText = {
  page: 'صفحه',
  more: 'بیشتر',
  to: 'تا',
  of: 'از',
  next: 'بعدی',
  last: 'آخرین',
  first: 'اولین',
  previous: 'قبلی',
  loadingOoo: 'در حال بارگذاری...',
  selectAll: 'انتخاب همه',
  searchOoo: 'جستجو...',
  blanks: 'خالی',
  filterOoo: 'فیلتر...',
  applyFilter: 'اعمال فیلتر...',
  equals: 'برابر',
  notEqual: 'نابرابر',
  lessThan: 'کمتر از',
  greaterThan: 'بیشتر از',
  contains: 'شامل',
  notContains: 'شامل نیست',
  startsWith: 'شروع با',
  endsWith: 'پایان با',
  noRowsToShow: 'داده‌ای برای نمایش وجود ندارد',
  pinColumn: 'سنجاق ستون',
  autosizeThiscolumn: 'تنظیم اندازه این ستون',
  autosizeAllColumns: 'تنظیم اندازه همه ستون‌ها',
  resetColumns: 'بازنشانی ستون‌ها',
  expandAll: 'باز کردن همه',
  collapseAll: 'بستن همه',
  copy: 'کپی',
  copyWithHeaders: 'کپی با سرستون‌ها',
  paste: 'چسباندن',
  columnMenu: 'منوی ستون'
};

const resolvedColumnDefs = computed<ColDef[]>(() => {
  const columns = [...props.columnDefs];
  if (props.showActions) {
    columns.push({
      headerName: 'عملیات',
      field: '__actions',
      cellRenderer: ActionCell,
      sortable: false,
      filter: false,
      minWidth: 190,
      pinned: 'right'
    });
  }
  return columns;
});

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api;
  if (props.loading) {
    event.api.showLoadingOverlay();
  }
};

watch(
  () => props.loading,
  (loading) => {
    if (!gridApi.value) return;
    if (loading) {
      gridApi.value.showLoadingOverlay();
    } else if (!props.rowData.length) {
      gridApi.value.showNoRowsOverlay();
    } else {
      gridApi.value.hideOverlay();
    }
  }
);

watch(
  () => props.rowData,
  (rows) => {
    if (!gridApi.value || props.loading) return;
    if (!rows.length) {
      gridApi.value.showNoRowsOverlay();
    } else {
      gridApi.value.hideOverlay();
    }
  },
  { deep: true }
);
</script>

<style scoped>
@import 'ag-grid-community/styles/ag-grid.css';
@import 'ag-grid-community/styles/ag-theme-quartz.css';

:global(.ag-theme-quartz) {
  --ag-background-color: var(--color-surface);
  --ag-foreground-color: var(--color-text);
  --ag-border-color: var(--color-border);
  --ag-secondary-border-color: var(--color-border);
  --ag-header-background-color: var(--color-surface-muted);
  --ag-header-foreground-color: var(--color-text);
  --ag-row-hover-color: var(--color-primary-soft);
  --ag-selected-row-background-color: var(--color-primary-soft);
  --ag-odd-row-background-color: var(--color-surface);
  --ag-font-family: var(--font-sans);
  --ag-font-size: 13px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
}

:global(.ag-theme-quartz .ag-header-cell) {
  font-weight: 600;
}

:global(.ag-theme-quartz .ag-root-wrapper) {
  border: none;
}

.action-btn {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--color-surface-muted);
}

.action-danger {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.4);
}
</style>
