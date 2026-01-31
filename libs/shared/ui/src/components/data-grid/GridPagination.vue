<template>
  <div class="w-full flex items-center justify-between mt-2">
    <slot name="footer-start" />

    <div class="pager flex items-center justify-end gap-2 text-sm">
      <span>صفحه:</span>
      <button
        class="border rounded px-2 py-1 hover:bg-gray-50 transition-colors"
        :disabled="pageIndex <= 0"
        @click="$emit('page-change', 0)"
      >
        « اول
      </button>
      <button
        class="border rounded px-2 py-1 hover:bg-gray-50 transition-colors"
        :disabled="pageIndex <= 0"
        @click="$emit('page-change', pageIndex - 1)"
      >
        ‹ قبلی
      </button>
      <span>{{ pageIndex + 1 }} / {{ totalPages }}</span>
      <button
        class="border rounded px-2 py-1 hover:bg-gray-50 transition-colors"
        :disabled="pageIndex >= totalPages - 1"
        @click="$emit('page-change', pageIndex + 1)"
      >
        بعدی ›
      </button>
      <button
        class="border rounded px-2 py-1 hover:bg-gray-50 transition-colors"
        :disabled="pageIndex >= totalPages - 1"
        @click="$emit('page-change', totalPages - 1)"
      >
        آخر »
      </button>
    </div>

    <slot name="footer-end" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pageIndex: number;
  totalPages: number;
  isLocalMode: boolean;
}>();

defineEmits<{
  (e: "page-change", page: number): void;
}>();
</script>

<style scoped>
.pager button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager button:not(:disabled):hover {
  border-color: #d1d5db;
}
</style>