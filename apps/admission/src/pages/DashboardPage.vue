<template>
  <UiPage>
    <UiPageHeader title="Admission Dashboard" subtitle="Application flow overview" />
    <div class="kpi-grid">
      <UiCard>
        <h3>New</h3>
        <p class="kpi">{{ kpis.new }}</p>
      </UiCard>
      <UiCard>
        <h3>In review</h3>
        <p class="kpi">{{ kpis.inReview }}</p>
      </UiCard>
      <UiCard>
        <h3>Accepted</h3>
        <p class="kpi">{{ kpis.accepted }}</p>
      </UiCard>
      <UiCard>
        <h3>Rejected</h3>
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
    new: apps.filter((item) => item.status === 'new').length,
    inReview: apps.filter((item) => item.status === 'in_review').length,
    accepted: apps.filter((item) => item.status === 'accepted').length,
    rejected: apps.filter((item) => item.status === 'rejected').length
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
