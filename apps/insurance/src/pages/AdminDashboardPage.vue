<template>
  <PageShell>
    <PageHeader title="مدیریت بیمه" subtitle="تاییدیه‌ها و حاکمیت">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'بیمه' }, { label: 'مدیریت بیمه' }]" />
      </template>
    </PageHeader>
    <div class="grid">
      <div class="card">
        <h3 class="title">تاییدیه‌های در انتظار</h3>
        <p class="kpi">{{ pendingApprovals }}</p>
      </div>
      <div class="card">
        <h3 class="title">تعداد کل بیمه‌نامه‌ها</h3>
        <p class="kpi">{{ policyCount }}</p>
      </div>
    </div>
  </PageShell>
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
