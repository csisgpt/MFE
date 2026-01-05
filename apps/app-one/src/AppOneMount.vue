<template>
  <div class="app-one">
    <nav class="subnav">
      <UiButton type="link" @click="navigate('')">Dashboard</UiButton>
      <UiButton type="link" @click="navigate('orders')">Orders</UiButton>
    </nav>
    <component
      :is="currentView"
      :order-id="orderId"
      @open-order="handleOpenOrder"
      @back-to-orders="handleBackToOrders"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';
import OrdersPage from './pages/OrdersPage.vue';
import OrderDetailsPage from './pages/OrderDetailsPage.vue';

const route = useRoute();
const router = useRouter();

const subPath = computed(() => {
  const raw = route.params.catchAll;
  if (Array.isArray(raw)) {
    return raw.join('/');
  }
  return raw ?? '';
});

const orderId = computed(() => {
  if (subPath.value.startsWith('orders/')) {
    return subPath.value.split('/')[1];
  }
  return '';
});

const currentView = computed(() => {
  if (subPath.value.startsWith('orders/')) {
    return OrderDetailsPage;
  }
  if (subPath.value.startsWith('orders')) {
    return OrdersPage;
  }
  return DashboardPage;
});

const navigate = (target: string) => {
  const path = target ? `/app-one/${target}` : '/app-one';
  router.push(path);
};

const handleOpenOrder = (id: string) => {
  router.push(`/app-one/orders/${id}`);
};

const handleBackToOrders = () => {
  router.push('/app-one/orders');
};
</script>

<style scoped>
.subnav {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
