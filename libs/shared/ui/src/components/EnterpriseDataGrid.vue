<template>
  <div class="relative w-full">
    <div class="ag-theme-quartz w-full" :style="{ minHeight }">
      <AgGridVue
        :column-defs="resolvedColumnDefs"
        :row-data="rowData"
        :default-col-def="defaultColDef"
        :locale-text="localeText"
        :pagination="paginationEnabled"
        :pagination-page-size="paginationPageSize"
        :enable-rtl="true"
        :dom-layout="domLayout"
        :row-selection="rowSelection || undefined"
        :animate-rows="true"
        :suppress-row-click-selection="rowSelection ? false : true"
        :overlay-loading-template="loadingTemplate"
        :overlay-no-rows-template="noRowsTemplate"
        :context="{ onRowAction }"
        @grid-ready="onGridReady"
        @sort-changed="handleSortChanged"
        @filter-changed="handleFilterChanged"
        @pagination-changed="handlePaginationChanged"
      />
    </div>
    <div
      v-if="error"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-4 text-center"
    >
      <p class="text-sm text-[var(--color-text)]">{{ error }}</p>
      <button class="action-button" type="button" @click="emit('retry')">تلاش دوباره</button>
    </div>

    <div
      v-if="showEmptyState"
      class="mt-4"
    >
      <EmptyState
        title="داده‌ای یافت نشد"
        description="برای شروع می‌توانید مورد جدیدی ثبت کنید."
      >
        <button
          v-if="emptyActionLabel"
          class="action-button"
          type="button"
          @click="emit('empty-action')"
        >
          {{ emptyActionLabel }}
        </button>
      </EmptyState>
    </div>

    <div v-if="paginationMode === 'server'" class="pagination">
      <button class="secondary-button" type="button" :disabled="page <= 1" @click="changePage(page - 1)">
        قبلی
      </button>
      <span class="text-xs text-[var(--color-text-muted)]">
        صفحه {{ page }} از {{ totalPages }}
      </span>
      <button
        class="secondary-button"
        type="button"
        :disabled="page >= totalPages"
        @click="changePage(page + 1)"
      >
        بعدی
      </button>
      <select class="page-size" :value="pageSize" @change="handlePageSizeChange">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }} سطر
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import type { ColDef, GridReadyEvent, SortChangedEvent, FilterChangedEvent } from 'ag-grid-community';
import { computed, ref, watch } from 'vue';
import ActionButtonsRenderer from '../aggrid/ActionButtonsRenderer.vue';
import StatusBadgeRenderer from '../aggrid/StatusBadgeRenderer.vue';
import { formatPersianDate, formatPersianNumber } from '../aggrid/DateCellFormatter';
import EmptyState from './EmptyState.vue';

const props = withDefaults(
  defineProps<{
    rowData: unknown[];
    columnDefs: ColDef[];
    loading?: boolean;
    error?: string;
    pagination?: boolean;
    paginationPageSize?: number;
    paginationMode?: 'client' | 'server';
    page?: number;
    pageSize?: number;
    total?: number;
    minHeight?: string;
    domLayout?: 'autoHeight' | 'normal' | 'print';
    showActions?: boolean;
    rowSelection?: 'single' | 'multiple' | null;
    quickFilter?: string;
    quickFilterDebounceMs?: number;
    emptyActionLabel?: string;
    pageSizeOptions?: number[];
  }>(),
  {
    loading: false,
    error: '',
    pagination: true,
    paginationPageSize: 8,
    paginationMode: 'client',
    page: 1,
    pageSize: 8,
    total: 0,
    minHeight: '320px',
    domLayout: 'autoHeight',
    showActions: false,
    rowSelection: null,
    quickFilter: '',
    quickFilterDebounceMs: 300,
    emptyActionLabel: '',
    pageSizeOptions: () => [6, 10, 20]
  }
);

const emit = defineEmits<{
  (e: 'row-action', payload: { type: 'view' | 'edit' | 'delete'; row: unknown }): void;
  (e: 'page-change', payload: { page: number; pageSize: number }): void;
  (e: 'sort-change', payload: { sortModel: unknown }): void;
  (e: 'filter-change', payload: { filterModel: unknown }): void;
  (e: 'retry'): void;
  (e: 'empty-action'): void;
}>();

const onRowAction = (type: 'view' | 'edit' | 'delete', row: unknown) => {
  emit('row-action', { type, row });
};

const gridApi = ref<GridReadyEvent['api'] | null>(null);
const quickFilterTimer = ref<number | null>(null);

const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  minWidth: 120
};

const loadingTemplate = '<span class="ag-overlay-loading-center">در حال بارگذاری...</span>';
const noRowsTemplate = '<span class="ag-overlay-no-rows-center">داده‌ای برای نمایش وجود ندارد</span>';

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
  applyFilter: 'اعمال فیلتر',
  equals: 'برابر',
  notEqual: 'نابرابر',
  lessThan: 'کمتر از',
  greaterThan: 'بیشتر از',
  lessThanOrEqual: 'کمتر یا برابر',
  greaterThanOrEqual: 'بیشتر یا برابر',
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
  columnMenu: 'منوی ستون',
  columns: 'ستون‌ها',
  filters: 'فیلترها',
  noPin: 'بدون سنجاق',
  pinLeft: 'سنجاق به چپ',
  pinRight: 'سنجاق به راست',
  valueColumns: 'ستون‌های مقدار',
  pivotMode: 'حالت محور',
  groups: 'گروه‌ها',
  rowGroupColumnsEmptyMessage: 'برای گروه‌بندی ستون را بکشید',
  valueColumnsEmptyMessage: 'برای محاسبه ستون را بکشید',
  pivotColumnsEmptyMessage: 'برای محور ستون را بکشید',
  group: 'گروه',
  rowGroup: 'گروه‌بندی',
  rows: 'ردیف‌ها',
  sum: 'جمع',
  min: 'کمینه',
  max: 'بیشینه',
  none: 'هیچ‌کدام',
  count: 'تعداد',
  avg: 'میانگین',
  filteredRows: 'ردیف‌های فیلتر شده',
  selectedRows: 'ردیف‌های انتخاب شده',
  totalRows: 'کل ردیف‌ها',
  totalAndFilteredRows: 'کل و فیلتر شده',
  columnsPanel: 'ستون‌ها',
  filtersPanel: 'فیلترها'
};

const enhanceColumnDef = (col: ColDef): ColDef => {
  const field = String(col.field ?? '');
  const isDateField = /date|at$/i.test(field);
  const isStatusField = field.toLowerCase().includes('status');
  const isNumericField = ['amount', 'total', 'value'].some((key) => field.toLowerCase().includes(key));

  return {
    ...col,
    cellRenderer: col.cellRenderer ?? (isStatusField ? StatusBadgeRenderer : col.cellRenderer),
    valueFormatter:
      col.valueFormatter ??
      (isDateField
        ? (params) => formatPersianDate(params.value)
        : isNumericField
          ? (params) => formatPersianNumber(params.value)
          : undefined)
  };
};

const resolvedColumnDefs = computed<ColDef[]>(() => {
  const columns = props.columnDefs.map(enhanceColumnDef);
  if (props.showActions) {
    columns.push({
      headerName: 'عملیات',
      field: '__actions',
      cellRenderer: ActionButtonsRenderer,
      sortable: false,
      filter: false,
      minWidth: 160,
      pinned: 'left'
    });
  }
  return columns;
});

const paginationEnabled = computed(() => props.pagination && props.paginationMode === 'client');
const showEmptyState = computed(
  () => !props.loading && !props.error && props.paginationMode === 'server' && props.rowData.length === 0
);

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api;
  if (props.loading) {
    event.api.showLoadingOverlay();
  }
};

const handleSortChanged = (event: SortChangedEvent) => {
  emit('sort-change', { sortModel: event.api.getSortModel() });
};

const handleFilterChanged = (event: FilterChangedEvent) => {
  emit('filter-change', { filterModel: event.api.getFilterModel() });
};

const handlePaginationChanged = () => {
  if (!gridApi.value || props.paginationMode !== 'client') return;
  emit('page-change', {
    page: gridApi.value.paginationGetCurrentPage() + 1,
    pageSize: gridApi.value.paginationGetPageSize()
  });
};

const changePage = (page: number) => {
  emit('page-change', { page, pageSize: props.pageSize });
};

const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const nextSize = Number(target.value);
  emit('page-change', { page: 1, pageSize: nextSize });
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

watch(
  () => props.quickFilter,
  (value) => {
    if (!gridApi.value) return;
    if (quickFilterTimer.value) {
      clearTimeout(quickFilterTimer.value);
    }
    quickFilterTimer.value = window.setTimeout(() => {
      gridApi.value?.setQuickFilter(value ?? '');
    }, props.quickFilterDebounceMs);
  }
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
  --ag-row-hover-color: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
  --ag-selected-row-background-color: color-mix(in srgb, var(--color-primary) 16%, var(--color-surface));
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

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}

.secondary-button {
  background: var(--color-surface-muted);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 6px 12px;
  border-radius: 10px;
}

.pagination {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.page-size {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 10px;
  padding: 4px 8px;
  font-size: 12px;
}
</style>
