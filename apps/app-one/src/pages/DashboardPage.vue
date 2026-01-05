<template>
  <div class="grid">
    <UiCard>
      <h3>Welcome, {{ authStore.user?.name }}</h3>
      <p>Here is your app-one dashboard.</p>
      <UiButton type="primary" @click="counter++">Local Count: {{ counter }}</UiButton>
    </UiCard>
    <UiCard>
      <h3>Summary</h3>
      <p>Active orders: {{ summary.activeOrders }}</p>
      <p>Region: {{ summary.region }}</p>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHostAuthStore } from '@shared/store';

const authStore = useHostAuthStore();
const counter = ref(0);
const summary = ref({ activeOrders: 3, region: 'US-East' });
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
</style>
