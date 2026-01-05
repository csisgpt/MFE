<template>
  <div class="page">
    <UiCard>
      <h1>Shell Host</h1>
      <p>Welcome to the CSIS micro-frontend shell.</p>
      <div class="links">
        <RouterLink to="/app-one">Go to App One</RouterLink>
        <RouterLink to="/app-two">Go to App Two</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/settings">Settings</RouterLink>
        <RouterLink to="/profile">Profile</RouterLink>
      </div>
    </UiCard>
    <div class="grid">
      <UiCard>
        <h3>Auth Status</h3>
        <p v-if="authStore.isAuthenticated">Logged in as {{ authStore.user?.name }}</p>
        <p v-else>Not authenticated</p>
      </UiCard>
      <UiCard>
        <h3>Runtime Config</h3>
        <ul>
          <li>apiBaseUrl: {{ config.apiBaseUrl }}</li>
          <li>featureFlags: {{ JSON.stringify(config.featureFlags) }}</li>
          <li>remotePrefixes: {{ JSON.stringify(config.remotePrefixes) }}</li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getConfig } from '@shared/config';
import { useHostAuthStore } from '@shared/store';

const authStore = useHostAuthStore();
const config = getConfig();
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
</style>
