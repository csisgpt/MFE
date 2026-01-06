<template>
  <UiPage>
    <UiPageHeader title="Profile" subtitle="User session details" />
    <UiSection>
      <p>Name: {{ authStore.user?.name }}</p>
      <p>Role: {{ authStore.user?.role }}</p>
      <UiButton type="primary" @click="handleLogout">Logout</UiButton>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { useHostAuthStore } from '@shared/store';
import { logout } from '@shared/auth';

const authStore = useHostAuthStore();

const handleLogout = () => {
  logout();
};
</script>
