<template>
  <div class="ops">
    <nav class="subnav">
      <UiButton type="link" @click="navigate('')">نمای کلی</UiButton>
      <UiButton type="link" @click="navigate('reports')">گزارش‌ها</UiButton>
      <UiButton type="link" @click="navigate('analytics')">تحلیل‌ها</UiButton>
      <UiButton type="link" @click="navigate('alerts')">هشدارها</UiButton>
      <UiButton type="link" @click="navigate('admin')">مدیریت</UiButton>
    </nav>
    <component :is="currentView" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import OverviewPage from './pages/OverviewPage.vue';
import ReportsPage from './pages/ReportsPage.vue';
import ReportCreatePage from './pages/ReportCreatePage.vue';
import AnalyticsPage from './pages/AnalyticsPage.vue';
import AlertsPage from './pages/AlertsPage.vue';
import AdminPage from './pages/AdminPage.vue';

const route = useRoute();
const router = useRouter();

const subPath = computed(() => {
  const raw = route.params.catchAll;
  if (Array.isArray(raw)) {
    return raw.join('/');
  }
  return raw ?? '';
});

const currentView = computed(() => {
  if (subPath.value.startsWith('reports/create')) {
    return ReportCreatePage;
  }
  if (subPath.value.startsWith('reports')) {
    return ReportsPage;
  }
  if (subPath.value.startsWith('analytics')) {
    return AnalyticsPage;
  }
  if (subPath.value.startsWith('alerts')) {
    return AlertsPage;
  }
  if (subPath.value.startsWith('admin')) {
    return AdminPage;
  }
  return OverviewPage;
});

const navigate = (target: string) => {
  const path = target ? `/ops/${target}` : '/ops';
  router.push(path);
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
