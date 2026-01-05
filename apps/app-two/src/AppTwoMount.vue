<template>
  <div class="app-two">
    <nav class="subnav">
      <UiButton type="link" @click="navigate('')">Overview</UiButton>
      <UiButton type="link" @click="navigate('users')">Users</UiButton>
      <UiButton type="link" @click="navigate('reports')">Reports</UiButton>
    </nav>
    <component :is="currentView" @open-users="navigate('users')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import OverviewPage from './pages/OverviewPage.vue';
import UsersPage from './pages/UsersPage.vue';
import ReportsPage from './pages/ReportsPage.vue';

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
  if (subPath.value.startsWith('users')) {
    return UsersPage;
  }
  if (subPath.value.startsWith('reports')) {
    return ReportsPage;
  }
  return OverviewPage;
});

const navigate = (target: string) => {
  const path = target ? `/app-two/${target}` : '/app-two';
  router.push(path);
};
</script>

<style scoped>
.subnav {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
