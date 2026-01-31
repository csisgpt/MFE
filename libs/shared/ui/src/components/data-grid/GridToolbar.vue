<template>
  <div class="toolbar flex gap-2 items-center mb-2">
    <div
      class="text-lg text-[var(--theme-label-color)] font-bold !grow flex items-center gap-4"
    >
      <span class="!leading-7 my-2 mr-2">{{ title }}</span>

      <div v-if="hasQuickSearch" class="max-w-[250px] w-full">
        <v-text-field
          class="field"
          variant="solo"
          density="compact"
          :model-value="searchText"
          :disabled="isLoading"
          name="title"
          placeholder="جستجوی سریع"
          hide-details
          @update:model-value="emit('search-text-change', $event)"
        />
      </div>
    </div>

    <div class="!min-w-fit flex gap-4 items-center">
      <slot name="toolbar-start" />

      <div
        class="btn btn-white border"
        v-if="showRefreshButton"
        @click="$emit('refresh')"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="inline-block animate-spin">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
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
        </span>
        {{ refreshButtonText }}
      </div>

      <div v-if="showExtraButtons" @click="emit('expand')" class="btn btn-white border">
        باز کردن همه
      </div>
      <div v-if="showExtraButtons" @click="emit('collapse')" class="btn btn-white border">بستن همه</div>

      <slot name="toolbar-end" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  searchText: string;
  hasQuickSearch: boolean;
  showRefreshButton: boolean;
  showExtraButtons : boolean ,
  refreshButtonText: string;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "search-text-change", value: string): void;
  (e: "refresh"): void;
  (e: "expand"): void;
  (e: "collapse"): void;
}>();
</script>

<style scoped>
.toolbar {
  direction: rtl;
}
</style>
