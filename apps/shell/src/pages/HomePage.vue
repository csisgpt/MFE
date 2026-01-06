<template>
  <UiPage>
    <UiPageHeader title="Shell Dashboard" subtitle="Enterprise MFE command center" />
    <div class="grid">
      <UiCard>
        <h3>Quick Links</h3>
        <div class="links">
          <RouterLink to="/insurance">Insurance</RouterLink>
          <RouterLink to="/admission">Admission</RouterLink>
          <RouterLink to="/ops">Ops</RouterLink>
          <RouterLink to="/system">System</RouterLink>
          <RouterLink to="/audit">Audit</RouterLink>
        </div>
      </UiCard>
      <UiCard>
        <h3>Auth Status</h3>
        <p v-if="authStore.token?.length > 0">Logged in as {{ authStore.user?.name }}</p>
        <p v-else>Not authenticated</p>
      </UiCard>
      <UiCard >
        <h3 class="bg-primary!">Runtime Config</h3>
        <ul>
          <li>apiBaseUrl: {{ config.apiBaseUrl }}</li>
          <li class="!break-all">featureFlags: {{ JSON.stringify(config.featureFlags) }}</li>
          <li class="!break-all">remotePrefixes: {{ JSON.stringify(config.remotePrefixes) }}</li>
        </ul>
      </UiCard>
    </div>
  </UiPage>
</template>

<script setup lang="ts">
import { getConfig } from '@shared/config';
import { useHostAuthStore } from '@shared/store';

const authStore = useHostAuthStore();
const config = getConfig();
</script>

<style scoped>
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
