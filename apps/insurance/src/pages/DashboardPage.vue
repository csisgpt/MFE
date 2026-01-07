<template>
  <UiPage>
    <UiPageHeader title="داشبورد بیمه" subtitle="نمای کلی کارکنان" />
    <div class="kpi-grid">
      <UiCard>
        <h3>بیمه‌های فعال</h3>
        <p class="kpi">{{ policiesCount }}</p>
      </UiCard>
      <UiCard>
        <h3>درخواست‌های در انتظار</h3>
        <p class="kpi">{{ pendingRequests }}</p>
      </UiCard>
      <UiCard>
        <h3>خسارت‌های باز</h3>
        <p class="kpi">{{ openClaims }}</p>
      </UiCard>
    </div>
  </UiPage>
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
