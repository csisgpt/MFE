export function useGridFilters() {
  const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  const toSafeString = (v: any): string => {
    if (v == null) return "";
    if (Array.isArray(v)) return v.map(toSafeString).join(" ");
    return String(v);
  };

  const faToEn = (input: any): string => {
    const s = toSafeString(input);
    return s.replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d)));
  };

  const normalizeFa = (input: any): string => {
    const s = toSafeString(input);
    return s
      .trim()
      .replace(/\u200c/g, " ")
      .replace(/[كﮎﮏ]/g, "ک")
      .replace(/[يىې]/g, "ی")
      .replace(/\s+/g, " ");
  };

  const normalizeFilter = (filterModel: any) => {
    // لاجیک نرمالایز کردن فیلتر را اینجا بنویسید
    return filterModel;
  };

  return {
    toSafeString,
    faToEn,
    normalizeFa,
    normalizeFilter,
  };
}
