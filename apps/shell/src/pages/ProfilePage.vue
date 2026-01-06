<template>
  <UiPage>
    <UiPageHeader title="پروفایل" subtitle="جزئیات نشست کاربر" />
    <UiSection>
      <p>نام: {{ authStore.user?.name }}</p>
      <p>نقش: {{ roleLabel }}</p>
      <UiButton type="primary" @click="handleLogout">خروج</UiButton>
    </UiSection>
  </UiPage>
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
