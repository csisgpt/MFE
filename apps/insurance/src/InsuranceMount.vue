<template>
  <div class="insurance">
    <nav class="subnav">
      <UiButton type="link" @click="navigate('')">داشبورد</UiButton>
      <UiButton type="link" @click="navigate('requests')">درخواست‌ها</UiButton>
      <UiButton type="link" @click="navigate('claims')">خسارت‌ها</UiButton>
      <UiButton type="link" @click="navigate('admin')">مدیریت</UiButton>
    </nav>
    <component
      :is="currentView"
      :request-id="requestId"
      @open-request="handleOpenRequest"
      @back-to-requests="handleBackToRequests"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';
import RequestsPage from './pages/RequestsPage.vue';
import RequestCreatePage from './pages/RequestCreatePage.vue';
import ClaimsPage from './pages/ClaimsPage.vue';
import ClaimCreatePage from './pages/ClaimCreatePage.vue';
import AdminDashboardPage from './pages/AdminDashboardPage.vue';
import AdminRequestsPage from './pages/AdminRequestsPage.vue';
import AdminRequestDetailPage from './pages/AdminRequestDetailPage.vue';
import AdminPoliciesPage from './pages/AdminPoliciesPage.vue';

const route = useRoute();
const router = useRouter();

const subPath = computed(() => {
  const raw = route.params.catchAll;
  if (Array.isArray(raw)) {
    return raw.join('/');
  }
  return raw ?? '';
});

const requestId = computed(() => {
  if (subPath.value.startsWith('admin/requests/')) {
    return subPath.value.split('/')[2];
  }
  return '';
});

const currentView = computed(() => {
  if (subPath.value.startsWith('requests/create')) {
    return RequestCreatePage;
  }
  if (subPath.value.startsWith('requests')) {
    return RequestsPage;
  }
  if (subPath.value.startsWith('claims/create')) {
    return ClaimCreatePage;
  }
  if (subPath.value.startsWith('claims')) {
    return ClaimsPage;
  }
  if (subPath.value.startsWith('admin/requests/')) {
    return AdminRequestDetailPage;
  }
  if (subPath.value.startsWith('admin/requests')) {
    return AdminRequestsPage;
  }
  if (subPath.value.startsWith('admin/policies')) {
    return AdminPoliciesPage;
  }
  if (subPath.value.startsWith('admin')) {
    return AdminDashboardPage;
  }
  return DashboardPage;
});

const navigate = (target: string) => {
  const path = target ? `/insurance/${target}` : '/insurance';
  router.push(path);
};

const handleOpenRequest = (id: string) => {
  router.push(`/insurance/admin/requests/${id}`);
};

const handleBackToRequests = () => {
  router.push('/insurance/admin/requests');
};
</script>

<style scoped>
.subnav {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
