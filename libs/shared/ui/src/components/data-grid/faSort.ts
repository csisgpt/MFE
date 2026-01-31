const digitMap = "۰۱۲۳۴۵۶۷۸۹";
const toEnDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(digitMap.indexOf(d)));

export const normalizeFa = (input: unknown) => {
  const s = String(input ?? "");
  return toEnDigits(
    s
      // ی و ک عربی → فارسی
      .replace(/\u064A/g, "ی").replace(/\u0643/g, "ک").replace(/\u0649/g, "ی")
      // حذف کشیده و اعراب
      .replace(/\u0640/g, "").replace(/[\u064B-\u065F\u0670]/g, "")
      // ZWNJ → فاصلهٔ معمولی
      .replace(/\u200c/g, " ")
      .trim()
  );
};

const collatorFa = new Intl.Collator("fa", {
  sensitivity: "base",
  numeric: true,
  ignorePunctuation: true,
});

export const faCompare = (a: unknown, b: unknown) =>
  collatorFa.compare(normalizeFa(a), normalizeFa(b));