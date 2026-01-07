<template>
  <PageShell>
    <PageHeader title="داشبورد بیمه" subtitle="نمای کلی کارکنان">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'داشبورد' }]" />
      </template>
    </PageHeader>
    <div class="grid">
      <div class="card">
        <h3 class="title">بیمه‌های فعال</h3>
        <p class="kpi">{{ policiesCount }}</p>
      </div>
      <div class="card">
        <h3 class="title">درخواست‌های در انتظار</h3>
        <p class="kpi">{{ pendingRequests }}</p>
      </div>
      <div class="card">
        <h3 class="title">خسارت‌های باز</h3>
        <p class="kpi">{{ openClaims }}</p>
      </div>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getClaims, getInsuranceRequests, getPolicies } from '@shared/api-client';

const requests = ref([]);
const claims = ref([]);
const policies = ref([]);

const pendingRequests = computed(
  () => requests.value.filter((item: { status: string }) => item.status === 'در انتظار').length
);
const openClaims = computed(
  () => claims.value.filter((item: { status: string }) => item.status === 'باز').length
);
const policiesCount = computed(() => policies.value.length);

onMounted(async () => {
  requests.value = await getInsuranceRequests();
  claims.value = await getClaims();
  policies.value = await getPolicies();
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
