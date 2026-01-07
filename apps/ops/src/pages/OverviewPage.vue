<template>
  <UiPage>
    <UiPageHeader title="نمای کلی عملیات" subtitle="شاخص‌های کلیدی میان‌حوزه‌ای" />
    <div class="kpi-grid">
      <UiCard v-for="kpi in kpis" :key="kpi.label">
        <h3>{{ kpi.label }}</h3>
        <p class="kpi">{{ kpi.value }}</p>
      </UiCard>
    </div>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getOpsKpis } from '@shared/api-client';

const kpis = ref<{ label: string; value: number }[]>([]);

onMounted(async () => {
  kpis.value = await getOpsKpis();
});
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.kpi {
  font-size: 24px;
  margin: 8px 0 0;
}
</style>
