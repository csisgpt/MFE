<template>
  <UiPage>
    <UiPageHeader title="مدیریت بیمه" subtitle="تاییدیه‌ها و حاکمیت" />
    <div class="kpi-grid">
      <UiCard>
        <h3>تاییدیه‌های در انتظار</h3>
        <p class="kpi">{{ pendingApprovals }}</p>
      </UiCard>
      <UiCard>
        <h3>تعداد کل بیمه‌نامه‌ها</h3>
        <p class="kpi">{{ policyCount }}</p>
      </UiCard>
    </div>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getInsuranceRequests, getPolicies } from '@shared/api-client';

const requests = ref([]);
const policies = ref([]);

const pendingApprovals = computed(
  () => requests.value.filter((item: { status: string }) => item.status === 'در انتظار').length
);
const policyCount = computed(() => policies.value.length);

onMounted(async () => {
  requests.value = await getInsuranceRequests();
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
