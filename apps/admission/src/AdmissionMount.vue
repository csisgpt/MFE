<template>
  <div class="admission">
    <nav class="subnav">
      <UiButton type="link" @click="navigate('')">Dashboard</UiButton>
      <UiButton type="link" @click="navigate('applications')">Applications</UiButton>
      <UiButton type="link" @click="navigate('config')">Config</UiButton>
    </nav>
    <component :is="currentView" :application-id="applicationId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';
import ApplicationsPage from './pages/ApplicationsPage.vue';
import ApplicationDetailPage from './pages/ApplicationDetailPage.vue';
import ApplicationReviewPage from './pages/ApplicationReviewPage.vue';
import ApplicationDecisionPage from './pages/ApplicationDecisionPage.vue';
import ConfigPage from './pages/ConfigPage.vue';

const route = useRoute();
const router = useRouter();

const subPath = computed(() => {
  const raw = route.params.catchAll;
  if (Array.isArray(raw)) {
    return raw.join('/');
  }
  return raw ?? '';
});

const applicationId = computed(() => {
  if (subPath.value.startsWith('applications/')) {
    return subPath.value.split('/')[1];
  }
  return '';
});

const currentView = computed(() => {
  if (subPath.value.endsWith('/review')) {
    return ApplicationReviewPage;
  }
  if (subPath.value.endsWith('/decision')) {
    return ApplicationDecisionPage;
  }
  if (subPath.value.startsWith('applications/') && applicationId.value) {
    return ApplicationDetailPage;
  }
  if (subPath.value.startsWith('applications')) {
    return ApplicationsPage;
  }
  if (subPath.value.startsWith('config')) {
    return ConfigPage;
  }
  return DashboardPage;
});

const navigate = (target: string) => {
  const path = target ? `/admission/${target}` : '/admission';
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
