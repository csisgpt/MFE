<template>
  <div v-if="!isGridLoaded" class="flex items-center justify-center grow!">
    <div class="text-center">
      <div class="mb-2">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
      <p class="text-gray-500">در حال بارگذاری جدول...</p>
    </div>
  </div>

  <template v-else>
    <div
      class="flex flex-col h-full w-full"
      :dir="direction"
      ref="gridContainer"
    >
      <!-- Toolbar -->
      <GridToolbar
        v-if="showToolbar"
        :title="title"
        :search-text="searchText"
        :has-quick-search="hasQuickSearch"
        :show-extra-buttons="showExtraButtons"
        :show-refresh-button="showRefreshButton"
        :refresh-button-text="refreshButtonText"
        :is-loading="isLoading"
        @collapse="collapseAll"
        @expand="expandAll"
        @search-text-change="onSearchTextChange"
        :AutoSizeStrategy="'SizeColumnsToContentStrategy'"
        @refresh="refreshAll"
      >
        <template #toolbar-start>
          <slot name="toolbar-start" />
        </template>
        <template #toolbar-end>
          <slot name="toolbar-end" />
        </template>
      </GridToolbar>

      <!-- Grid -->
      <AgGridVue
        ref="gridRef"
        style="width: 100%; height: 100%"
        v-bind="gridOptions"
        @first-data-rendered="onFirstDataRendered"
        @grid-size-changed="onGridSizeChanged"
        @column-visible="onColumnsChanged"
        @displayed-columns-changed="onColumnsChanged"
        @grid-ready="onGridReady"
        @filter-changed="onFilterOrSortChanged"
        @sort-changed="onFilterOrSortChanged"
      />

      <!-- Pagination -->
      <GridPagination
        v-if="showPagination && (!isServerSide || isLocalMode)"
        :page-index="pageIndex"
        :total-pages="totalPages"
        :is-local-mode="isLocalMode"
        @page-change="gotoPage"
      >
        <template #footer-start>
          <slot name="footer-start" />
        </template>
        <template #footer-end>
          <slot name="footer-end" />
        </template>
      </GridPagination>
    </div>
  </template>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  shallowRef,
  onBeforeUnmount,
  useAttrs,
  defineOptions,
  nextTick,
  onMounted,
  onBeforeMount,
} from "vue";
import { themeQuartz, TooltipModule } from "ag-grid-community";

import type {
  GridApi,
  GridReadyEvent,
  GridOptions,
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IDatasource,
  IGetRowsParams,
} from "ag-grid-community";

// @ts-ignore
import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale";

import { buildSortBy, buildTransportedFilters } from "./filters";
import type { RequestPayload } from "./types";
import GridToolbar from "./GridToolbar.vue";
import GridPagination from "./GridPagination.vue";
import { useGridFilters } from "./composables/useGridFilters";
import { useGridData } from "./composables/useGridData";
import GridTooltip from "./GridTooltip.vue";

defineOptions({ inheritAttrs: false });

interface Props {
  mode?: "server" | "local" | "infinite";
  localData?: any[];

  apiUrl?: string;
  apiMethod?: "get" | "post";
  requestTransformer?: (payload: RequestPayload) => any;
  responseTransformer?: (response: any) => { data: any[]; totalCount: number };
  additionalPayload?: Record<string, any>;
  additionalFilters?: Record<string, any>;

  loading?: boolean;
  columnDefs: ColDef[];
  defaultColDef?: ColDef;

  title?: string;
  showToolbar?: boolean;
  showExtraButtons?: boolean;
  showRefreshButton?: boolean;
  refreshButtonText?: string;
  showPagination?: boolean;
  direction?: "rtl" | "ltr";
  enableRtl?: boolean;

  pageSize?: number;
  overlayNoRowsTemplate?: string;
  localeText?: any;
  filterDebounce?: number;
  hasQuickSearch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "server",
  localData: () => [],
  apiMethod: "post",
  title: "جدول داده‌ها",
  showToolbar: false,
  showRefreshButton: true,
  refreshButtonText: "بازنشانی",
  showPagination: false,
  direction: "rtl",
  enableRtl: true,
  loading: false,
  pageSize: 20,
  localeText: AG_GRID_LOCALE_IR,
  filterDebounce: 300,
  showExtraButtons: false,
  hasQuickSearch: false,
  overlayNoRowsTemplate: `
    <div class="rg-empty">
      <div class="rg-empty-card">
        <div class="rg-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none">
            <path d="M4 7a3 3 0 0 1 3-3h7l6 6v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7z"
                  stroke="currentColor" stroke-width="1.5" opacity=".6"/>
            <path d="M14 4v4a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
            <circle cx="8.25" cy="15.25" r="1.25" fill="currentColor" opacity=".85"/>
            <circle cx="12" cy="15.25" r="1.25" fill="currentColor" opacity=".7"/>
            <circle cx="15.75" cy="15.25" r="1.25" fill="currentColor" opacity=".55"/>
          </svg>
        </div>
        <div class="rg-empty-title">داده‌ای برای نمایش پیدا نشد</div>
      </div>
    </div>
  `,
  additionalFilters: () => ({}),
});

const emit = defineEmits<{
  (e: "ready", api: GridApi): void;
  (e: "data-loaded", data: any[]): void;
  (e: "load-error", error: any): void;
  (e: "row-data-updated"): void;
  (e: "col-change"): void;
}>();

/* ======================== Lazy Load ag-grid ======================== */
let AgGridVue: any = null;
let autosizeTimer: ReturnType<typeof setTimeout> | null = null;

const myTheme = themeQuartz.withParams({
  backgroundColor : "var(--color-surface-muted)" ,
  textColor : "var(--color-text)",
  borderColor : "var(--color-border)"
}); // یا .withParams({...}) برای شخصی‌سازی

const isGridLoaded = ref(false);

const loadAgGrid = async () => {
  if (AgGridVue) return;

  try {
    const module = await import("ag-grid-vue3");
    AgGridVue = module.AgGridVue;

    // ✅ ag-grid CSS را در اینجا لود کن (فقط زمانی که کامپوننت نیاز پیدا کند)

    // ✅ ModuleRegistry را صرفاً زمانی بارگذاری کن که ag-grid لود شود
    const { ModuleRegistry, AllCommunityModule, TooltipModule } = await import(
      "ag-grid-community"
    );

    const { AllEnterpriseModule, LicenseManager, IntegratedChartsModule } =
      await import("ag-grid-enterprise");

    const { AgChartsEnterpriseModule } = await import("ag-charts-enterprise");

    ModuleRegistry.registerModules([
      AllCommunityModule,
      AllEnterpriseModule,
      TooltipModule,
      IntegratedChartsModule.with(AgChartsEnterpriseModule),
    ]);

    LicenseManager.setLicenseKey("DownloadDevTools_COM_NDEwMjM0NTgwMDAwMA==59158b5225400879a12a96634544f5b6");

    isGridLoaded.value = true;
  } catch (error) {
    console.error("❌ خطا در بارگذاری ag-grid:", error);
    emit("load-error", error);
  }
};

/* ======================== State Management ======================== */
const $attrs = useAttrs() as Partial<GridOptions> & Record<string, any>;
const gridRef = ref<InstanceType<typeof AgGridVue> | null>(null);
const gridApi = ref<GridApi | null>(null);
const gridContainer = ref<HTMLElement | null>(null);

const pageIndex = ref(0);
const totalCount = ref(0);
const currentPageSize = ref(props.pageSize);
const aborter = shallowRef<AbortController | null>(null);
const searchText = ref("");
const isLoading = ref(false);

const isLocalMode = computed(() => props.mode === "local");
const isServerSide = computed(
  () => resolvedRowModelType.value === "serverSide"
);

const resolvedRowModelType = computed<NonNullable<GridOptions["rowModelType"]>>(
  () => {
    if (isLocalMode.value) return "clientSide";
    // اگر کاربر مستقیماً rowModelType داد، همونو بگیر
    const explicit = ($attrs.rowModelType as any) || undefined;
    if (explicit) return explicit;
    // وگرنه از mode نتیجه بگیر
    return props.mode === "infinite" ? "infinite" : "serverSide";
  }
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / currentPageSize.value))
);

/* ======================== Composables ======================== */
const { normalizeFilter, toSafeString, faToEn, normalizeFa } = useGridFilters();
const { fetchServerData, buildPayload } = useGridData(
  props,
  gridApi,
  buildTransportedFilters,
  buildSortBy
);

/* ======================== Computed Props ======================== */
const mergedDefaultColDef = computed<ColDef>(() => ({
  resizable: true,
  floatingFilter: true,

  suppressHeaderMenuButton: false,
  suppressSizeToFit: true,
  headerClass: "!min-w-fit",
  autoHeaderHeight: true,
  filterParams: {
    defaultToNothingSelected: true,
    suppressMultiSelect: false,
    suppressSelectAll: true,
    buttons: ["clear", "apply"],
  },
  ...(props.defaultColDef ?? {}),
}));

const gridOptions = computed<Partial<GridOptions>>(() => ({
  enableRtl: props.enableRtl,
  localeText: props.localeText,
  overlayNoRowsTemplate: props.overlayNoRowsTemplate,
  paginationPageSize: currentPageSize.value,
  cacheQuickFilter: true,
  tooltipShowDelay: 0,
  loading: props.loading,
  theme : myTheme ,

  components: {
    GridTooltip,
  },

  quickFilterParser: (q: string) => {
    const base = normalizeFa(q);
    const both = (base + " " + faToEn(base)).trim();
    return both ? both.split(/\s+/).filter(Boolean) : [];
  },

  quickFilterMatcher: (aggregate: any, parts: any) => {
    const aggRaw = Array.isArray(aggregate)
      ? aggregate.join(" ")
      : toSafeString(aggregate);

    const aggNorm = normalizeFa(aggRaw);
    const aggFull = (aggNorm + " " + faToEn(aggNorm)).trim();

    const tokens: string[] = Array.isArray(parts) ? parts : [parts];
    const cleanTokens = tokens
      .map((t) => normalizeFa(toSafeString(t)))
      .filter(Boolean);

    return cleanTokens.every((p) => aggFull.includes(p));
  },

  ...$attrs,

  columnDefs: props.columnDefs,
  defaultColDef: {
    ...($attrs.defaultColDef as any),
    ...mergedDefaultColDef.value,

    tooltipComponent: "GridTooltip",
    tooltipComponentParams: {
      // مثلا:
      // color: "#55AA77",
    },
  },

  rowModelType: resolvedRowModelType.value,
  rowData: isLocalMode.value ? props.localData : undefined,
}));

/* ======================== API Methods ======================== */
async function fetchBlock(request: any, startRow: number, endRow: number) {
  aborter.value?.abort();
  const controller = new AbortController();
  aborter.value = controller;

  try {
    isLoading.value = true;
    const payload = buildPayload(startRow, endRow, request);
    const { data, totalCount: count } = await fetchServerData(
      payload,
      controller.signal
    );

    totalCount.value = count;
    pageIndex.value = payload.pageIndex - 1;
    emit("data-loaded", data);

    return {
      rows: data,
      lastRow: count,
    };
  } finally {
    isLoading.value = false;
  }
}

async function onGridReady(e: GridReadyEvent) {
  gridApi.value = e.api as GridApi;
  e.api.setGridOption("cacheBlockSize", currentPageSize.value);
  emit("ready", e.api as GridApi);

  if (isLocalMode.value) {
    totalCount.value = props.localData?.length || 0;
    return;
  }

  if (resolvedRowModelType.value === "serverSide") {
    const ds: IServerSideDatasource = {
      getRows: async (params: IServerSideGetRowsParams) => {
        try {
          const { startRow, endRow } = params.request as any;
          const { rows, lastRow } = await fetchBlock(
            params.request,
            startRow,
            endRow
          );
          params.success({
            rowData: rows,
            rowCount: lastRow || rows.length,
          });
        } catch (err: any) {
          if (err?.code !== "ERR_CANCELED" && err?.name !== "CanceledError") {
            console.error("❌ Grid Data Error:", err);
            params.fail();
          }
        }
      },
    };
    e.api.setGridOption("serverSideDatasource", ds);
  } else if (resolvedRowModelType.value === "infinite") {
    const ds: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const { startRow, endRow } = params as any;
          const { rows, lastRow } = await fetchBlock({}, startRow, endRow);
          params.successCallback(rows, lastRow || rows.length);
        } catch (err: any) {
          if (err?.code !== "ERR_CANCELED" && err?.name !== "CanceledError") {
            console.error("❌ Grid Infinite Error:", err);
            params.failCallback();
          }
        }
      },
    };
    e.api.setGridOption("datasource", ds);
  }
}

/* ======================== Debounce Filter/Sort ======================== */
let filterTimer: ReturnType<typeof setTimeout> | null = null;

function onFilterOrSortChanged() {
  if (filterTimer) clearTimeout(filterTimer);

  filterTimer = setTimeout(() => {
    if (gridApi.value && !isLocalMode.value) {
      refreshAll();
    }
  }, props.filterDebounce);
}

/* ======================== Commands ======================== */
function refreshAll() {
  const api = gridApi.value;
  if (!api) return;

  if (isLocalMode.value) {
    api.setGridOption("rowData", props.localData);
    totalCount.value = props.localData?.length || 0;
    queueSmartFit(api.getColumnApi?.());

    return;
  }

  if (resolvedRowModelType.value === "serverSide") {
    api.refreshServerSide({ purge: true });
  } else if (resolvedRowModelType.value === "infinite") {
    api.purgeInfiniteCache();
  }

  nextTick(() => queueSmartFit(api.getColumnApi?.()));
}

function gotoPage(targetPage: number) {
  const api = gridApi.value;
  if (!api) return;

  pageIndex.value = Math.max(0, Math.min(targetPage, totalPages.value - 1));
  const startRow = pageIndex.value * currentPageSize.value;
  api.ensureIndexVisible?.(startRow);

  if (resolvedRowModelType.value === "infinite" && !isLocalMode.value) {
    api.purgeInfiniteCache();
  }
}

function expandAll() {
  gridApi.value?.expandAll();
}
function collapseAll() {
  gridApi.value?.collapseAll();
}

function onSearchTextChange(value: any) {
  searchText.value = value;
  const api = gridApi.value;
  if (!api) return;

  if (typeof (api as any).setGridOption === "function") {
    api.setGridOption("quickFilterText", toSafeString(value));
  } else {
    (api as any).setQuickFilter?.(value ?? "");
  }

  if (!isLocalMode.value) {
    refreshAll();
  }
}

/* ======================== Watchers ======================== */
watch(
  () => props.localData,
  async (newData) => {
    await nextTick(() => {
      if (isLocalMode.value && gridApi.value) {
        totalCount.value = newData?.length || 0;
        emit("row-data-updated");
      }
    });
  },
  { deep: true }
);

watch(
  () => props.pageSize,
  (newSize) => {
    currentPageSize.value = newSize;
    if (gridApi.value) {
      gridApi.value.paginationSetPageSize?.(newSize);
      if (!isLocalMode.value && resolvedRowModelType.value === "serverSide") {
        gridApi.value.refreshServerSide({ purge: true });
      }
    }
  }
);

function queueSmartFit(
  columnApi = gridApi.value?.getColumnApi?.() ||
    (gridApi.value as any)?.columnApi
) {
  if (!columnApi) return;
  if (autosizeTimer) clearTimeout(autosizeTimer);
  autosizeTimer = setTimeout(() => smartFitColumns(columnApi), 0);
}

function smartFitColumns(columnApi: any) {
  const api = gridApi.value as any;
  if (!columnApi || !api) return;

  // 1) ابتدا بر اساس هدر/محتوا اندازه‌گذاری دقیق
  const cols = columnApi.getAllColumns?.() || [];
  if (!cols.length) return;
  const allIds = cols.map((c: any) => c.getId());
  columnApi.autoSizeColumns(allIds, /*skipHeader*/ false);

  // 2) عرض مؤثر باکس گرید
  const containerEl: HTMLElement | null = gridContainer.value;
  const containerWidth =
    containerEl?.clientWidth ??
    // fallback خیلی محافظه‌کارانه
    cols.reduce((sum: number, c: any) => sum + c.getActualWidth(), 0);

  // مجموع عرض فعلی ستون‌ها پس از autoSize
  const totalWidth = cols.reduce(
    (sum: number, c: any) => sum + c.getActualWidth(),
    0
  );

  // 3) اگر فضای خالی داریم: flex بده، اما حداقل را پهنای autoSize قرار بده
  if (totalWidth < containerWidth) {
    const state = cols.map((c: any) => ({
      colId: c.getId(),
      // minWidth = عرض فعلی (نتیجه‌ی auto-size) => کوچک‌تر از هدر نشیم
      minWidth: c.getActualWidth(),
      flex: 1, // اجازه بده با هم عرض را پر کنند
      width: undefined, // flex مدیریت می‌کند
    }));

    columnApi.applyColumnState({ state, applyOrder: true });
  } else {
    // 4) اگر ستون‌ها زیاد/عریض‌اند: flex را حذف کن تا اسکرول افقی داشته باشیم
    const state = cols.map((c: any) => ({
      colId: c.getId(),
      flex: undefined,
      // عرض فعلی را (که همان auto-size است) نگه می‌داریم
      width: c.getActualWidth(),
      // برای پایداری: حداقل را هم کمتر از این نگذار
      minWidth: Math.min(c.getActualWidth(), 10000),
    }));
    columnApi.applyColumnState({ state, applyOrder: true });
  }
}

function queueAutoSize(
  columnApi = gridApi.value?.getColumnApi?.() ||
    (gridApi.value as any)?.columnApi
) {
  if (!columnApi) return;
  if (autosizeTimer) clearTimeout(autosizeTimer);
  autosizeTimer = setTimeout(() => autoSizeAllColumns(columnApi), 0);
}

function autoSizeAllColumns(columnApi: any) {
  const cols = columnApi.getAllColumns?.() || [];
  if (!cols.length) return;

  const allIds = cols.map((c: any) => c.getId());
  // دومین آرگومان: skipHeader = false => هدرها هم در محاسبه لحاظ می‌شوند
  columnApi.autoSizeColumns(allIds, false);
}

// اجرا در زمان‌های کلیدی:
const onFirstDataRendered = (params: any) => {
  queueSmartFit(params.columnApi);
};

const onGridSizeChanged = (params: any) => {
  // اگر flex نداری، autoSize بهتره؛ اگر flex خواستی، اینجا می‌تونی sizeColumnsToFit() بزنی
  queueSmartFit(params.columnApi);
};

const onColumnsChanged = (params: any) => {
  queueSmartFit(params.columnApi);
  emit('col-change')
};

/* ======================== Lifecycle ======================== */
onMounted(async () => {
  await loadAgGrid();
});

/* ======================== Cleanup ======================== */
onBeforeUnmount(() => {
  aborter.value?.abort();
  if (filterTimer) clearTimeout(filterTimer);
});

/* ======================== Expose API ======================== */
defineExpose({
  refreshAll,
  gotoPage,
  getGridApi: () => gridApi.value,
  getTotalCount: () => totalCount.value,
  getPageIndex: () => pageIndex.value,
  getSearchText: () => searchText.value,
  setSearchText: (text: string) => {
    searchText.value = text;
  },
  isLoading: () => isLoading.value,
});
</script>

<style scoped>
.ag-theme-quartz {
  --ag-header-height: 48px;
  --ag-row-height: 40px;
}

.rg-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.rg-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 24rem;
  text-align: center;
}

.rg-empty-icon {
  color: #9ca3af;
}

.rg-empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6b7280;
}
</style>
