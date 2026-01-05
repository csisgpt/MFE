<template>
  <div class="remote-wrapper">
    <div class="remote-header">
      <h2>{{ title }}</h2>
      <div class="breadcrumb">Shell / {{ title }}</div>
    </div>
    <component :is="remoteComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

interface Props {
  remote: 'appOne' | 'appTwo';
  title: string;
}

const props = defineProps<Props>();

const remoteComponent = computed(() => {
  if (props.remote === 'appOne') {
    return defineAsyncComponent(() => import('appOne/AppOneMount'));
  }
  return defineAsyncComponent(() => import('appTwo/AppTwoMount'));
});
</script>

<style scoped>
.remote-wrapper {
  padding: 24px;
}

.remote-header {
  margin-bottom: 16px;
}

.breadcrumb {
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
