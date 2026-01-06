<template>
  <div class="grid">
    <UiCard>
      <h3>Welcome, {{ authStore.user?.name }}</h3>
      <p>Here is your app-one dashboard.</p>
      <UiButton type="primary" @click="appOneStore.incrementCounter">
        Local Count: {{ appOneStore.dashboardCounter }}
      </UiButton>
    </UiCard>
    <UiCard>
      <h3>Summary</h3>
      <p>Active orders: {{ appOneStore.summary.activeOrders }}</p>
      <p>Region: {{ appOneStore.summary.region }}</p>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { useHostAuthStore } from '@shared/store';
import { useAppOneStore } from '../stores/app-one.store';

const authStore = useHostAuthStore();
const appOneStore = useAppOneStore();
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
</style>
