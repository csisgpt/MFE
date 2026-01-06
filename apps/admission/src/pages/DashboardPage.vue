<template>
  <UiPage>
    <UiPageHeader title="داشبورد پذیرش" subtitle="نمای کلی جریان پذیرش" />
    <div class="kpi-grid">
      <UiCard>
        <h3>جدید</h3>
        <p class="kpi">{{ kpis.new }}</p>
      </UiCard>
      <UiCard>
        <h3>در بررسی</h3>
        <p class="kpi">{{ kpis.inReview }}</p>
      </UiCard>
      <UiCard>
        <h3>پذیرفته‌شده</h3>
        <p class="kpi">{{ kpis.accepted }}</p>
      </UiCard>
      <UiCard>
        <h3>رد شده</h3>
        <p class="kpi">{{ kpis.rejected }}</p>
      </UiCard>
    </div>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getAdmissionApplications } from '@shared/api-client';

const kpis = ref({ new: 0, inReview: 0, accepted: 0, rejected: 0 });

onMounted(async () => {
  const apps = await getAdmissionApplications();
  kpis.value = {
    new: apps.filter((item) => item.status === 'جدید').length,
    inReview: apps.filter((item) => item.status === 'در بررسی').length,
    accepted: apps.filter((item) => item.status === 'پذیرفته‌شده').length,
    rejected: apps.filter((item) => item.status === 'رد شده').length
  };
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
