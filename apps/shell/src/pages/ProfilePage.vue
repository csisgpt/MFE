<template>
  <PageShell>
    <PageHeader title="پروفایل" subtitle="جزئیات نشست کاربر">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'خانه', to: '/' }, { label: 'پروفایل' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <div class="space-y-2 text-sm">
        <p>نام: {{ authStore.user?.name }}</p>
        <p>نقش: {{ roleLabel }}</p>
      </div>
      <button class="logout-button" type="button" @click="handleLogout">خروج از سامانه</button>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHostAuthStore } from '@shared/store';
import { logout } from '@shared/auth';

const authStore = useHostAuthStore();
const roleLabel = computed(() => {
  switch (authStore.user?.role) {
    case 'admin':
      return 'مدیر';
    case 'employee':
      return 'کارمند';
    case 'reviewer':
      return 'بازبین';
    case 'ops':
      return 'عملیات';
    case 'user':
      return 'کاربر';
    default:
      return 'نامشخص';
  }
});

const handleLogout = () => {
  logout();
};
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logout-button {
  align-self: flex-start;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}
</style>
