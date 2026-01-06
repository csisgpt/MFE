<template>
  <UiPage>
    <UiPageHeader title="Insurance Dashboard" subtitle="Employee overview" />
    <div class="kpi-grid">
      <UiCard>
        <h3>Active policies</h3>
        <p class="kpi">{{ policiesCount }}</p>
      </UiCard>
      <UiCard>
        <h3>Pending requests</h3>
        <p class="kpi">{{ pendingRequests }}</p>
      </UiCard>
      <UiCard>
        <h3>Open claims</h3>
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
  () => requests.value.filter((item: { status: string }) => item.status === 'pending').length
);
const openClaims = computed(
  () => claims.value.filter((item: { status: string }) => item.status === 'open').length
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
