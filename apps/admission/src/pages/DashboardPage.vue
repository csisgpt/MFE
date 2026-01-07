<template>
  <PageShell>
    <PageHeader title="داشبورد پذیرش" subtitle="نمای کلی جریان پذیرش">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'پذیرش' }, { label: 'داشبورد' }]" />
      </template>
    </PageHeader>
    <div class="grid">
      <div class="card">
        <h3 class="title">جدید</h3>
        <p class="kpi">{{ kpis.new }}</p>
      </div>
      <div class="card">
        <h3 class="title">در بررسی</h3>
        <p class="kpi">{{ kpis.inReview }}</p>
      </div>
      <div class="card">
        <h3 class="title">پذیرفته‌شده</h3>
        <p class="kpi">{{ kpis.accepted }}</p>
      </div>
      <div class="card">
        <h3 class="title">رد شده</h3>
        <p class="kpi">{{ kpis.rejected }}</p>
      </div>
    </div>
  </PageShell>
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
