<template>
  <UiPage>
    <UiPageHeader title="Ops Admin" subtitle="Feature flags and remote controls" />
    <UiSection>
      <p v-if="!isAdmin" class="warning">Admin permissions required.</p>
      <div v-else>
        <h4>Feature flags</h4>
        <ul>
          <li v-for="(value, key) in flags" :key="key">{{ key }}: {{ value ? 'on' : 'off' }}</li>
        </ul>
      </div>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getConfig } from '@shared/config';
import { can } from '@shared/permissions';

const flags = getConfig().featureFlags;
const isAdmin = computed(() => can('ops:admin'));
</script>

<style scoped>
.warning {
  color: #dc2626;
}
</style>
