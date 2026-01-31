import type { ColDef } from "ag-grid-community";
import type { SearchFilter } from "./types";

/** عملگرهای بک‌اند */
export const OP = {
  EQUAL: 0,
  GREATER_THAN: 1,
  GREATER_THAN_OR_EQUAL: 2,
  LESS_THAN: 3,
  LESS_THAN_OR_EQUAL: 4,
  NOT_EQUAL: 5,
  CONTAINS: 6,
  STARTS_WITH: 7,
  ENDS_WITH: 8,
  EMPTY: 9,
  NOT_EMPTY: 10,
} as const;

const DEFAULT_JOIN_DELIM = ",";

/** نحوه‌ی ارسال هر ستون در payload */
export type TransportMode = "search" | "simple" | "both" | "none";

/** متای قابل تنظیم روی هر ستون (داخل columnDefs) */
export interface ColumnFilterOptions {
  /** آیا این ستون اصلاً برای ارسال فیلتر به سرور در نظر گرفته شود؟ پیش‌فرض: Boolean(colDef.filter) */
  filterable?: boolean;
  /** کلید بک‌اند برای فیلتر (پیش‌فرض: colDef.field) */
  backendKey?: string;
  /** کلید بک‌اند برای سورت (پیش‌فرض: backendKey یا colDef.field) */
  sortKey?: string;
  /** search | simple | both | none (پیش‌فرض: search) */
  transport?: TransportMode;
  /** ست‌ها عددی ارسال شوند؟ (برای status/flowStatus/priority و امثالهم) */
  numericSet?: boolean;
  /** وقتی set چند انتخابی است، در simple: first | last | join (پیش‌فرض: first) */
  simpleValue?: "first" | "last" | "join";
  /** جداکننده‌ی join (پیش‌فرض: ",") */
  joinDelim?: string;
}

/* ============================ Helpers ============================ */

function findCol(
  colDefs: Array<ColDef & { filterOptions?: ColumnFilterOptions }>,
  colId: string
) {
  return colDefs.find((d) => (d.colId ?? d.field) === colId);
}

function getOptions(
  colDefs: Array<ColDef & { filterOptions?: ColumnFilterOptions }>,
  colId: string
): ColumnFilterOptions & { _col?: ColDef } {
  const col = findCol(colDefs, colId);
  const fo = (col?.filterOptions ?? {}) as ColumnFilterOptions;
  const filterable =
    fo.filterable ?? Boolean(col?.filter); // پیش‌فرض: اگر در ag-Grid فیلتر دارد
  const backendKey = fo.backendKey ?? (col?.field as string | undefined);
  const sortKey = fo.sortKey ?? backendKey;

  return {
    filterable,
    backendKey,
    sortKey,
    transport: fo.transport ?? "search",
    numericSet: fo.numericSet ?? false,
    simpleValue: fo.simpleValue ?? "first",
    joinDelim: fo.joinDelim ?? DEFAULT_JOIN_DELIM,
    _col: col,
  };
}

const toNum = (v: any): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n =
    typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : undefined;
};

const toISODate = (v: any): string | undefined => {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return undefined;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function normalizeSetValues(
  raw: Array<string | number>,
  numeric: boolean
): Array<string | number> {
  if (!numeric) return raw;
  const out = raw
    .map((v) => toNum(v))
    .filter((n): n is number => n !== undefined);
  return out;
}

/* =================== Pushers: به searchFilters =================== */

function pushDateFilter(out: SearchFilter[], field: string, f: any) {
  switch (f?.type) {
    case "equals": {
      const s = toISODate(f.filter);
      if (s) out.push({ field, operator: OP.EQUAL, value: s });
      break;
    }
    case "lessThan": {
      const s = toISODate(f.filter);
      if (s) out.push({ field, operator: OP.LESS_THAN, value: s });
      break;
    }
    case "lessThanOrEqual": {
      const s = toISODate(f.filter);
      if (s) out.push({ field, operator: OP.LESS_THAN_OR_EQUAL, value: s });
      break;
    }
    case "greaterThan": {
      const s = toISODate(f.filter);
      if (s) out.push({ field, operator: OP.GREATER_THAN, value: s });
      break;
    }
    case "greaterThanOrEqual": {
      const s = toISODate(f.filter);
      if (s) out.push({ field, operator: OP.GREATER_THAN_OR_EQUAL, value: s });
      break;
    }
    case "inRange": {
      const a = toISODate(f.filter);
      const b = toISODate(f.filterTo);
      if (a) out.push({ field, operator: OP.GREATER_THAN_OR_EQUAL, value: a });
      if (b) out.push({ field, operator: OP.LESS_THAN_OR_EQUAL, value: b });
      break;
    }
  }
}

function pushNumberFilter(out: SearchFilter[], field: string, f: any) {
  switch (f?.type) {
    case "equals": {
      const n = toNum(f.filter);
      if (n !== undefined)
        out.push({ field, operator: OP.EQUAL, value: String(n) });
      break;
    }
    case "notEqual": {
      const n = toNum(f.filter);
      if (n !== undefined)
        out.push({ field, operator: OP.NOT_EQUAL, value: String(n) });
      break;
    }
    case "lessThan": {
      const n = toNum(f.filter);
      if (n !== undefined)
        out.push({ field, operator: OP.LESS_THAN, value: String(n) });
      break;
    }
    case "lessThanOrEqual": {
      const n = toNum(f.filter);
      if (n !== undefined)
        out.push({ field, operator: OP.LESS_THAN_OR_EQUAL, value: String(n) });
      break;
    }
    case "greaterThan": {
      const n = toNum(f.filter);
      if (n !== undefined)
        out.push({ field, operator: OP.GREATER_THAN, value: String(n) });
      break;
    }
    case "greaterThanOrEqual": {
      const n = toNum(f.filter);
      if (n !== undefined)
        out.push({
          field,
          operator: OP.GREATER_THAN_OR_EQUAL,
          value: String(n),
        });
      break;
    }
    case "inRange": {
      const a = toNum(f.filter);
      const b = toNum(f.filterTo);
      if (a !== undefined)
        out.push({
          field,
          operator: OP.GREATER_THAN_OR_EQUAL,
          value: String(a),
        });
      if (b !== undefined)
        out.push({ field, operator: OP.LESS_THAN_OR_EQUAL, value: String(b) });
      break;
    }
  }
}

function pushTextFilter(out: SearchFilter[], field: string, f: any) {
  const type = f?.type as string | undefined;

  if (type === "blank") {
    out.push({ field, operator: OP.EMPTY, value: "" });
    return;
  }
  if (type === "notBlank") {
    out.push({ field, operator: OP.NOT_EMPTY, value: "" });
    return;
  }

  switch (type) {
    case "equals":
      out.push({ field, operator: OP.EQUAL, value: String(f.filter ?? "") });
      break;
    case "notEqual":
      out.push({ field, operator: OP.NOT_EQUAL, value: String(f.filter ?? "") });
      break;
    case "contains":
      out.push({ field, operator: OP.CONTAINS, value: String(f.filter ?? "") });
      break;
    case "startsWith":
      out.push({
        field,
        operator: OP.STARTS_WITH,
        value: String(f.filter ?? ""),
      });
      break;
    case "endsWith":
      out.push({
        field,
        operator: OP.ENDS_WITH,
        value: String(f.filter ?? ""),
      });
      break;
  }
}

function pushSetFilterToSearch(
  out: SearchFilter[],
  field: string,
  f: any,
  opts: { numericSet: boolean; joinDelim: string }
) {
  let values = (f?.values ?? []) as Array<string | number>;
  if (!values.length) return;

  values = normalizeSetValues(values, opts.numericSet);
  if (!values.length) return;

  out.push({
    field,
    operator: OP.EQUAL,
    value: values,
  });
}

function pushCompositeFilter(
  out: SearchFilter[],
  field: string,
  f: any,
  opts: { numericSet: boolean; joinDelim: string }
) {
  if (f?.condition1) pushAnyFilter(out, field, f.condition1, opts);
  if (f?.condition2) pushAnyFilter(out, field, f.condition2, opts);
}

function pushAnyFilter(
  out: SearchFilter[],
  field: string,
  f: any,
  opts: { numericSet: boolean; joinDelim: string }
) {
  if (f?.filterType === "set" || Array.isArray(f?.values)) {
    pushSetFilterToSearch(out, field, f, opts);
    return;
  }
  if (f?.filterType === "date") {
    pushDateFilter(out, field, f);
    return;
  }
  if (f?.filterType === "number" || typeof f?.filter === "number") {
    pushNumberFilter(out, field, f);
    return;
  }
  pushTextFilter(out, field, f);
}

/* ===================== Simple extractor ===================== */

function extractSimpleValue(
  f: any,
  opts: {
    numericSet: boolean;
    simpleValuePref: "first" | "last" | "join";
    joinDelim: string;
  }
) {
  if (f?.filterType === "set" || Array.isArray(f?.values)) {
    let values = (f?.values ?? []) as Array<string | number>;
    if (!values.length) return undefined;

    values = normalizeSetValues(values, opts.numericSet);
    if (!values.length) return undefined;

    if (opts.simpleValuePref === "join") {
      return values;
    }
    return opts.simpleValuePref === "last"
      ? values[values.length - 1]
      : values[0];
  }

  // برای مقادیر غیرست، فقط equals منطقی است
  if (f?.type === "equals") {
    return f?.filter ?? undefined;
  }
  return undefined;
}

/* ======================= APIهای خروجی ======================= */

/** خروجی همزمان searchFilters + simple براساس meta ستون‌ها */
export function buildTransportedFilters(
  filterModel: any,
  colDefs: Array<ColDef & { filterOptions?: ColumnFilterOptions }>,
  simpleOverrides: Record<string, any> = {}
): { searchFilters: SearchFilter[]; simple: Record<string, unknown> } {
  const searchFilters: SearchFilter[] = [];
  const simple: Record<string, unknown> = {};

  if (filterModel && typeof filterModel === "object") {
    for (const colId of Object.keys(filterModel)) {
      const {
        filterable,
        backendKey,
        transport,
        numericSet,
        joinDelim,
        simpleValue,
      } = getOptions(colDefs, colId);

      // اگر ستون فیلترپذیر نیست یا کلید بک‌اند ندارد، رد شو
      if (!filterable || !backendKey) continue;

      const f = filterModel[colId];
      
      // SIMPLE
      if (transport === "simple" || transport === "both") {
        const unit = f?.operator ? f?.condition1 ?? f : f; // مرکب → فقط اولی برای simple
        const sv = extractSimpleValue(unit, {
          numericSet: !!numericSet,
          simpleValuePref: simpleValue!,
          joinDelim: joinDelim!,
        });
        if (sv !== undefined) simple[backendKey] = sv;
      }

      // SEARCH
      if (transport === "search" || transport === "both") {
        if (f?.operator && (f?.condition1 || f?.condition2)) {
          pushCompositeFilter(searchFilters, backendKey, f, {
            numericSet: !!numericSet,
            joinDelim: joinDelim!,
          });
        } else {
          pushAnyFilter(searchFilters, backendKey, f, {
            numericSet: !!numericSet,
            joinDelim: joinDelim!,
          });
        }
      }
    }
  }

  // Overrides خارجی (برای کلیدهایی که UI فیلتر ندارند)
  for (const [k, v] of Object.entries(simpleOverrides)) {
    if (v === undefined || v === null || v === "") continue;
    simple[k] = v;
  }

  return { searchFilters, simple };
}

/** فقط searchFilters (سازگار با گذشته). بهتر است colDefs بدهید. */
export function buildSearchFilters(
  filterModel: any,
  colDefs?: Array<ColDef & { filterOptions?: ColumnFilterOptions }>
): SearchFilter[] {
  if (!colDefs) return []; // اگر colDefs ندهید، عمداً چیزی نمی‌سازیم تا رفتار شفاف باشد
  const { searchFilters } = buildTransportedFilters(filterModel, colDefs, {});
  return searchFilters;
}

/**
 * ساختن sortBy از روی meta ستون‌ها
 * @param mode 'sign' → "-field" | 'sql' → "field asc/desc"
 */
export function buildSortBy(
  sortModel: Array<{ colId: string; sort: "asc" | "desc" }>,
  colDefs: Array<ColDef & { filterOptions?: ColumnFilterOptions }>,
  mode: "sign" | "sql" = "sign"
): string | null {
  if (!sortModel || !sortModel.length) return null;
  const first = sortModel[0];
  const { sortKey } = getOptions(colDefs, first.colId);
  if (!sortKey) return null;

  if (mode === "sign") {
    return `${first.sort === "desc" ? "-" : ""}${sortKey}`;
  }
  return `${sortKey} ${first.sort}`;
}
