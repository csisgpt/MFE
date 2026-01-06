<template>
  <div class="grid">
    <UiCard>
      <h3>خوش آمدید، {{ authStore.user?.name }}</h3>
      <p>این داشبورد اپلیکیشن یک شماست.</p>
      <UiButton type="primary" @click="appOneStore.incrementCounter">
        شمارنده محلی: {{ appOneStore.dashboardCounter }}
      </UiButton>
    </UiCard>
    <UiCard>
      <h3>خلاصه</h3>
      <p>سفارش‌های فعال: {{ appOneStore.summary.activeOrders }}</p>
      <p>منطقه: {{ appOneStore.summary.region }}</p>
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
