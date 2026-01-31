<template>
  <div class="app-one h-full flex flex-col">
    <nav class="subnav">
      <RouterLink
        v-for="(item, i) in APP_ONE_ROUTES?.filter((x) => x.path)"
        :to="`/app-one/${item.path}`"
        class="tab transition-all z-98"
        active-class="tab--active"
        >{{ item.meta?.label }}</RouterLink
      >
    </nav>
    <Transition mode="out-in" name="slide-fade">
      <component :is="currentView" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';
import UsersPage from './pages/UsersPage.vue';
import RequestsPage from './pages/RequestsPage.vue';
import APP_ONE_ROUTES from './configs/routes';
const route = useRoute();

const subPath = computed(() => {
  const raw = route.params.catchAll;
  if (Array.isArray(raw)) return raw.join('/');
  return raw ?? '';
});

const currentView = computed(() => {
  if (subPath.value.includes('users')) return UsersPage;
  if (subPath.value.includes('requests')) return RequestsPage;
  // هم /app-one و هم /app-one/home اگر خواستی
  return DashboardPage;
});
</script>

<style scoped>
.subnav {
  display: flex;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid var(--color-border);
  padding: 6px 14px;
  border-radius: 0 0 12px 12px;
  background: var(--color-surface);
  text-decoration: none;
}

.tab--active {
  background: color-mix(in srgb, var(--color-primary) 20%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
  transform: scale(1.2);
  margin-top: 4px;
  z-index: 99;
}
</style>
