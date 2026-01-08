<template>
  <div class="app-one">
    <nav class="subnav">
      <button class="tab" type="button" @click="navigate('')">نمای کلی</button>
      <button class="tab" type="button" @click="navigate('users')">کاربران</button>
      <button class="tab" type="button" @click="navigate('requests')">درخواست‌ها</button>
    </nav>
    <component :is="currentView" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';
import UsersPage from './pages/UsersPage.vue';
import RequestsPage from './pages/RequestsPage.vue';

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
  if (subPath.value.startsWith('requests')) {
    return RequestsPage;
  }
  return DashboardPage;
});

const navigate = (target: string) => {
  const path = target ? `/app-one/${target}` : '/app-one';
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

.tab {
  border: 1px solid var(--color-border);
  padding: 6px 14px;
  border-radius: 12px;
  background: var(--color-surface);
}
</style>
