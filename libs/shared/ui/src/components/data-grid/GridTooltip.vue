<template>
  <div
    class="bg-slate-900 text-slate-50 text-xs px-3 py-2 rounded-xl shadow-xl max-w-xs leading-relaxed border border-slate-700"
    style="direction: rtl"
  >
    <!-- حالت خاص ستون items -->
    <template v-if="isItemsColumn && items.length">
      <div class="font-semibold mb-1 text-[0.78rem] text-emerald-300">
        جزئیات آیتم‌ها
      </div>

      <div class="space-y-1 max-h-64 overflow-auto pr-1 custom-scroll">
        <div
          v-for="(it, idx) in items"
          :key="it.id ?? idx"
          class="flex flex-col gap-0.5 border-b border-slate-700/60 pb-1 last:border-0 last:pb-0"
        >
          <div class="flex justify-between gap-2">
            <span class="text-[0.78rem] font-medium truncate">
              {{ idx + 1 }}. {{ it.activityTitle }}
            </span>
            <span class="text-[0.7rem] opacity-80 whitespace-nowrap">
              ماه {{ it.month ?? '-' }}
            </span>
          </div>

          <div class="text-[0.7rem] flex flex-wrap gap-x-3 gap-y-0.5 opacity-90">
            <span>حجم: {{ format(it.requestedVolume) }}</span>
            <span>اعتبار: {{ format(it.requestedCredit) }}</span>
            <span v-if="it.consumptionPlaceId">
              مرکز مصرف: {{ it.consumptionPlaceId }}
              <!-- اگر مپ داری اینجا برچسب رو جایگزین کن -->
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- بقیه ستون‌ها (نمایش عمومی) -->
    <template v-else>
      <div class="text-[0.78rem]">
        {{ displayValue }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  params: any;
}>();

const isItemsColumn = computed(
  () => props.params?.colDef?.field === "items"
);

const items = computed(() => props.params?.data?.items ?? []);

const displayValue = computed(() => {
  // اگر برای ستون‌های دیگه tooltipValueGetter داری، اینجا valueFormatted میاد
  return props.params?.valueFormatted ?? props.params?.value ?? "";
});

const format = (val: unknown) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("fa-IR").format(n);
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.8);
  border-radius: 999px;
}
.custom-scroll::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
