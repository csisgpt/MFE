<template>
  <UiPage>
    <UiPageHeader :title="title" :subtitle="subtitle">
      <template #actions>
        <UiButton size="small" @click="loadRemote">Retry load</UiButton>
      </template>
    </UiPageHeader>
    <UiSection v-if="state === 'loading'" title="Loading">
      <div class="skeleton" />
    </UiSection>
    <UiSection v-else-if="state === 'disabled'" title="Remote disabled">
      <p>This remote is currently disabled via feature flags. Toggle it back on in System settings.</p>
    </UiSection>
    <UiSection v-else-if="state === 'error'" title="Remote failed">
      <p>{{ errorMessage }}</p>
      <UiButton size="small" type="primary" @click="loadRemote">Retry</UiButton>
    </UiSection>
    <component v-else :is="remoteComponent" />
  </UiPage>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, ref, watch } from 'vue';
import { eventBus } from '@shared/store';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';

interface Props {
  remote: RemoteKey;
  title: string;
  subtitle?: string;
}

const props = defineProps<Props>();
const remoteComponent = shallowRef();
const state = ref<'loading' | 'error' | 'loaded' | 'disabled'>('loading');
const errorMessage = ref('');
const statusStore = useRemoteStatusStore();

const loaders: Record<RemoteKey, () => Promise<unknown>> = {
  appOne: () => import('appOne/AppOneMount'),
  appTwo: () => import('appTwo/AppTwoMount'),
  insurance: () => import('insurance/InsuranceMount'),
  admission: () => import('admission/AdmissionMount'),
  ops: () => import('ops/OpsMount')
};

const isDisabled = computed(() => statusStore.disabled.has(props.remote));

async function loadRemote() {
  if (isDisabled.value) {
    state.value = 'disabled';
    return;
  }
  state.value = 'loading';
  statusStore.markLoading(props.remote);
  const loader = loaders[props.remote];
  try {
    const module = await Promise.race([
      loader(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Remote load timed out after 10s')), 10000)
      )
    ]);
    const component = (module as { default?: unknown }).default ?? module;
    remoteComponent.value = component;
    state.value = 'loaded';
    statusStore.markLoaded(props.remote);
  } catch (error) {
    const message = (error as Error).message || 'Remote failed to load';
    errorMessage.value = message;
    state.value = 'error';
    statusStore.markFailed(props.remote, message);
    eventBus.emit('TOAST', { type: 'error', message: `${props.title} failed to load` });
    eventBus.emit('AUDIT_LOG', {
      id: `audit_${Date.now()}`,
      level: 'error',
      message: `${props.title} failed to load`,
      source: 'shell',
      timestamp: new Date().toISOString(),
      context: { remote: props.remote, error: message }
    });
  }
}

watch(isDisabled, (disabled) => {
  if (disabled) {
    state.value = 'disabled';
  } else {
    loadRemote();
  }
});

onMounted(() => {
  loadRemote();
});
</script>

<style scoped>
.skeleton {
  width: 100%;
  height: 160px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  border-radius: var(--radius-md);
  animation: shimmer 1.6s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}
</style>
