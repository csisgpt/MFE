<template>
  <div class="app-one">
    <nav class="subnav">
      <UiButton
        class="tab"
        :class="{ active: subPath === '' }"
        type="default"
        @click="navigate('')"
      >
        <UiIcon name="home" />
        نمای کلی
      </UiButton>
      <UiButton
        class="tab"
        :class="{ active: subPath.startsWith('users') }"
        type="default"
        @click="navigate('users')"
      >
        <UiIcon name="users" />
        کاربران
      </UiButton>
      <UiButton
        class="tab"
        :class="{ active: subPath.startsWith('requests') }"
        type="default"
        @click="navigate('requests')"
      >
        <UiIcon name="requests" />
        درخواست‌ها
      </UiButton>
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  padding: 4px 14px;
}

.tab.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
</style>
