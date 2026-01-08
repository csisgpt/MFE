export const formatPersianDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('fa-IR');
};

export const formatPersianNumber = (value?: number) => {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('fa-IR');
};
