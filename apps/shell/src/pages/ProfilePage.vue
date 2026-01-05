<template>
  <UiCard>
    <h2>Profile</h2>
    <p>Name: {{ authStore.user?.name }}</p>
    <p>Role: {{ authStore.user?.role }}</p>
    <UiButton type="primary" @click="handleLogout">Logout</UiButton>
  </UiCard>
</template>

<script setup lang="ts">
import { useHostAuthStore } from '@shared/store';
import { logout } from '@shared/auth';

const authStore = useHostAuthStore();

const handleLogout = () => {
  logout();
};
</script>
