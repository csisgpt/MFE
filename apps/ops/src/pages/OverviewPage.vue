<template>
  <PageShell>
    <PageHeader title="نمای کلی عملیات" subtitle="شاخص‌های کلیدی میان‌حوزه‌ای">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'عملیات' }, { label: 'نمای کلی' }]" />
      </template>
    </PageHeader>
    <div class="grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="card">
        <h3 class="title">{{ kpi.label }}</h3>
        <p class="kpi">{{ kpi.value }}</p>
      </div>
    </div>
  </PageShell>
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.title {
  font-size: 14px;
  font-weight: 600;
}

.kpi {
  font-size: 24px;
  margin: 8px 0 0;
}
</style>
