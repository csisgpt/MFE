<template>
  <div class="w-full">
    <div class="ag-theme-quartz w-full" :style="{ minHeight }">
      <AgGridVue
        :column-defs="resolvedColumnDefs"
        :row-data="rowData"
        :default-col-def="defaultColDef"
        :locale-text="localeText"
        :pagination="gridPagination"
        :pagination-page-size="effectivePageSize"
        :enable-rtl="true"
        :dom-layout="domLayout"
        :context="{ onRowAction }"
        :row-height="rowHeight"
        :header-height="headerHeight"
        @grid-ready="onGridReady"
        @pagination-changed="handlePaginationChanged"
        @sort-changed="handleSortChanged"
        @filter-changed="handleFilterChanged"
        @column-moved="persistColumnState"
        @column-pinned="persistColumnState"
        @column-resized="persistColumnState"
        @column-visible="persistColumnState"
      />
    </div>
    <div
      v-if="showServerPagination"
      class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)]"
    >
      <div class="flex items-center gap-2">
        <span>نمایش</span>
        <UiSelect
          :value="effectivePageSize"
          :options="pageSizeOptions"
          size="small"
          @update:value="handlePageSizeChange"
        />
        <span>ردیف در هر صفحه</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-[var(--color-text-muted)]">
          {{ pageSummary }}
        </span>
        <div class="flex items-center gap-1">
          <UiButton size="small" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
            قبلی
          </UiButton>
          <UiButton
            size="small"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            بعدی
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { computed, ref, watch } from 'vue';
import UiButton from './UiButton.vue';
import UiSelect from './UiSelect.vue';
import ActionButtonsRenderer from '../aggrid/renderers/ActionButtonsRenderer.vue';

const props = withDefaults(
  defineProps<{
    rowData: unknown[];
    columnDefs: ColDef[];
    loading?: boolean;
    pagination?: boolean;
    paginationPageSize?: number;
    page?: number;
    pageSize?: number;
    total?: number;
    quickFilter?: string;
    storageKey?: string;
    minHeight?: string;
    domLayout?: 'autoHeight' | 'normal' | 'print';
    showActions?: boolean;
    floatingFilter?: boolean;
  }>(),
  {
    loading: false,
    pagination: true,
    paginationPageSize: 8,
    minHeight: '320px',
    domLayout: 'autoHeight',
    showActions: false,
    floatingFilter: false
  }
);

const onRowAction = (action: 'view' | 'edit' | 'delete', row: unknown) => {
  emit('row-action', { action, row });
};

const emit = defineEmits<{
  (e: 'row-action', payload: { action: 'view' | 'edit' | 'delete'; row: unknown }): void;
  (e: 'page-change', page: number): void;
  (e: 'pageSize-change', pageSize: number): void;
  (e: 'sort-change', model: unknown): void;
  (e: 'filter-change', model: unknown): void;
}>();

const gridApi = ref<GridReadyEvent['api'] | null>(null);
const columnApi = ref<GridReadyEvent['columnApi'] | null>(null);

const rowHeight = 52;
const headerHeight = 48;

const defaultColDef = computed<ColDef>(() => ({
  resizable: true,
  sortable: true,
  filter: true,
  floatingFilter: props.floatingFilter,
  minWidth: 140,
  flex: 1,
  wrapText: true,
  autoHeight: true
}));

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
  noRowsToShow: 'داده‌ای برای نمایش وجود ندارد',
  loadingError: 'بارگذاری با خطا مواجه شد',
  selectAll: 'انتخاب همه',
  searchOoo: 'جستجو...',
  blanks: 'خالی',
  filterOoo: 'فیلتر...',
  applyFilter: 'اعمال فیلتر',
  clearFilter: 'پاک کردن فیلتر',
  resetFilter: 'بازنشانی فیلتر',
  equals: 'برابر',
  notEqual: 'نابرابر',
  lessThan: 'کمتر از',
  greaterThan: 'بیشتر از',
  contains: 'شامل',
  notContains: 'شامل نیست',
  startsWith: 'شروع با',
  endsWith: 'پایان با',
  inRange: 'در بازه',
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
  pivotMode: 'حالت تجمیع',
  groups: 'گروه‌ها',
  rowGroupColumnsEmptyMessage: 'ستونی برای گروه‌بندی انتخاب نشده است',
  valueColumnsEmptyMessage: 'ستونی برای محاسبه انتخاب نشده است',
  pivotColumnsEmptyMessage: 'ستونی برای تجمیع انتخاب نشده است',
  group: 'گروه',
  groupBy: 'گروه‌بندی بر اساس',
  ungroupBy: 'حذف گروه‌بندی',
  addToValues: 'افزودن به مقادیر',
  removeFromValues: 'حذف از مقادیر',
  addToRowGroup: 'افزودن به گروه سطری',
  removeFromRowGroup: 'حذف از گروه سطری',
  addToColumnGroup: 'افزودن به گروه ستونی',
  removeFromColumnGroup: 'حذف از گروه ستونی',
  resetColumnsState: 'بازنشانی وضعیت ستون‌ها',
  expandAllRows: 'باز کردن همه ردیف‌ها',
  collapseAllRows: 'بستن همه ردیف‌ها',
  noPin: 'بدون سنجاق',
  pinLeft: 'سنجاق به چپ',
  pinRight: 'سنجاق به راست',
  resetGroup: 'بازنشانی گروه‌بندی',
  selectAllSearchResults: 'انتخاب نتایج جستجو',
  copyWithGroupHeaders: 'کپی با سرگروه‌ها',
  chartRange: 'نمودار بازه',
  chartPivot: 'نمودار تجمیعی',
  chartColumn: 'نمودار ستونی',
  chartBar: 'نمودار میله‌ای',
  chartLine: 'نمودار خطی',
  chartArea: 'نمودار ناحیه‌ای',
  chartPie: 'نمودار دایره‌ای',
  chartScatter: 'نمودار پراکندگی',
  chartHistogram: 'نمودار هیستوگرام',
  chartTreemap: 'نمودار درختی',
  chartBubble: 'نمودار حبابی',
  chartCombo: 'نمودار ترکیبی',
  chartCrossFilter: 'فیلتر متقاطع',
  chartSettings: 'تنظیمات نمودار',
  sideBar: 'نوار ابزار',
  toolPanel: 'پنل ابزار',
  rowDragRows: 'جابجایی ردیف‌ها',
  rowSelection: 'انتخاب ردیف',
  filterPanel: 'پنل فیلتر',
  values: 'مقادیر',
  pivot: 'محور',
  noDataToChart: 'داده‌ای برای نمودار وجود ندارد',
  noColumnsToChart: 'ستونی برای نمودار وجود ندارد',
  loadingOverlayLoading: 'در حال بارگذاری داده‌ها',
  loadingOverlayNoRows: 'داده‌ای برای نمایش وجود ندارد',
  selectedRows: 'ردیف‌های انتخاب‌شده'
};

const resolvedColumnDefs = computed<ColDef[]>(() => {
  const columns = [...props.columnDefs];
  if (props.showActions) {
    columns.push({
      headerName: 'عملیات',
      field: '__actions',
      cellRenderer: ActionButtonsRenderer,
      sortable: false,
      filter: false,
      minWidth: 140,
      pinned: 'right'
    });
  }
  return columns;
});

const effectivePageSize = computed(() => props.pageSize ?? props.paginationPageSize);
const showServerPagination = computed(
  () => props.pagination && props.page !== undefined && props.pageSize !== undefined && props.total !== undefined
);
const gridPagination = computed(() => props.pagination && !showServerPagination.value);
const currentPage = computed(() => props.page ?? 1);
const totalPages = computed(() => {
  if (!showServerPagination.value) return 1;
  return Math.max(1, Math.ceil((props.total ?? 0) / effectivePageSize.value));
});
const pageSizeOptions = computed(() => [5, 10, 20, 50].map((value) => ({
  value,
  label: `${value} ردیف`
})));
const pageSummary = computed(() => {
  if (!showServerPagination.value) return '';
  const total = props.total ?? 0;
  if (total === 0) return 'نمایش ۰ ردیف';
  const start = (currentPage.value - 1) * effectivePageSize.value + 1;
  const end = Math.min(currentPage.value * effectivePageSize.value, total);
  return `نمایش ${start} تا ${end} از ${total}`;
});

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api;
  columnApi.value = event.columnApi;
  if (props.storageKey) {
    const stored = localStorage.getItem(props.storageKey);
    if (stored) {
      try {
        const state = JSON.parse(stored);
        event.columnApi.applyColumnState({ state, applyOrder: true });
      } catch {
        localStorage.removeItem(props.storageKey);
      }
    }
  }
  if (props.quickFilter) {
    event.api.setQuickFilter(props.quickFilter);
  }
  if (props.loading) {
    event.api.showLoadingOverlay();
  }
};

const handlePaginationChanged = () => {
  if (!gridApi.value || !props.pagination || showServerPagination.value) return;
  const page = gridApi.value.paginationGetCurrentPage?.() ?? 0;
  emit('page-change', page + 1);
  emit('pageSize-change', gridApi.value.paginationGetPageSize?.() ?? effectivePageSize.value);
};

const handleSortChanged = () => {
  if (!gridApi.value) return;
  const model = gridApi.value.getSortModel?.() ?? [];
  emit('sort-change', model);
};

const handleFilterChanged = () => {
  if (!gridApi.value) return;
  const model = gridApi.value.getFilterModel?.() ?? {};
  emit('filter-change', model);
};

const persistColumnState = () => {
  if (!props.storageKey || !columnApi.value) return;
  const state = columnApi.value.getColumnState();
  localStorage.setItem(props.storageKey, JSON.stringify(state));
};

const handlePageSizeChange = (value: number) => {
  emit('pageSize-change', value);
};

const goToPage = (page: number) => {
  if (!showServerPagination.value) return;
  const next = Math.min(Math.max(page, 1), totalPages.value);
  emit('page-change', next);
};

const setQuickFilter = (value: string) => {
  if (!gridApi.value) return;
  gridApi.value.setQuickFilter?.(value ?? '');
};

defineExpose({ setQuickFilter });

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
    if (!gridApi.value || value === undefined) return;
    gridApi.value.setQuickFilter?.(value ?? '');
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
  --ag-header-cell-hover-background-color: var(--color-surface-muted);
  --ag-subheader-background-color: var(--color-surface-muted);
  --ag-control-panel-background-color: var(--color-surface);
  --ag-row-hover-color: var(--color-primary-soft);
  --ag-selected-row-background-color: var(--color-primary-soft);
  --ag-odd-row-background-color: var(--color-surface);
  --ag-row-border-color: var(--color-border);
  --ag-range-selection-border-color: var(--color-primary);
  --ag-range-selection-background-color: var(--color-primary-soft);
  --ag-input-border-color: var(--color-border);
  --ag-input-focus-border-color: var(--color-primary);
  --ag-font-family: var(--font-sans);
  --ag-font-size: 13px;
  --ag-border-radius: 16px;
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
</style>
