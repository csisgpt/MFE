import { computed, ref } from 'vue';

export const usePagedQuery = (initialPage = 1, initialPageSize = 10) => {
  const page = ref(initialPage);
  const pageSize = ref(initialPageSize);
  const total = ref(0);

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

  const setTotal = (value: number) => {
    total.value = value;
  };

  const setPage = (value: number) => {
    page.value = Math.max(1, value);
  };

  const setPageSize = (value: number) => {
    pageSize.value = value;
    page.value = 1;
  };

  return {
    page,
    pageSize,
    total,
    totalPages,
    setTotal,
    setPage,
    setPageSize
  };
};
