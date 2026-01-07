<template>
  <UiPage>
    <UiPageHeader :title="title" :subtitle="subtitle">
      <template #actions>
        <UiButton size="small" @click="loadRemote">تلاش دوباره</UiButton>
      </template>
    </UiPageHeader>
    <UiSection v-if="state === 'loading'" title="در حال بارگذاری">
      <div class="skeleton" />
    </UiSection>
    <UiSection v-else-if="state === 'disabled'" title="ریموت غیرفعال است">
      <p>این ریموت با فلگ‌های ویژگی غیرفعال شده است. آن را در بخش تنظیمات سیستم فعال کنید.</p>
    </UiSection>
    <UiSection v-else-if="state === 'error'" title="بارگذاری ناموفق">
      <p>{{ errorMessage }}</p>
      <UiButton size="small" type="primary" @click="loadRemote">تلاش دوباره</UiButton>
    </UiSection>
    <component v-else :is="remoteComponent" />
  </UiPage>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, ref, watch } from 'vue';
import { REMOTE_REGISTRY } from '@shared/config';
import { eventBus } from '@shared/store';
import { useRemoteStatusStore, type RemoteKey } from '../stores/remote-status.store';
import { loadRemoteMeta, remoteMountLoaders } from '../utils/remotes';

interface Props {
  remote: RemoteKey;
  subtitle?: string;
}

const props = defineProps<Props>();
const remoteComponent = shallowRef();
const state = ref<'loading' | 'error' | 'loaded' | 'disabled'>('loading');
const errorMessage = ref('');
const statusStore = useRemoteStatusStore();

const title = computed(() => {
  const match = REMOTE_REGISTRY.find((item) => item.id === props.remote);
  return match?.titleFa ?? 'ماژول';
});
const subtitle = computed(() => props.subtitle);

const isDisabled = computed(() => statusStore.disabled.has(props.remote));

async function loadRemote() {
  if (isDisabled.value) {
    state.value = 'disabled';
    return;
  }
  state.value = 'loading';
  statusStore.markLoading(props.remote);
  const loader = remoteMountLoaders[props.remote];
  if (!loader) {
    const message = 'ریموت ناشناخته است';
    errorMessage.value = message;
    state.value = 'error';
    statusStore.markFailed(props.remote, message);
    eventBus.emit('TOAST', { type: 'error', message });
    return;
  }
  try {
    const module = await Promise.race([
      loader(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('بارگذاری ریموت پس از ۱۰ ثانیه متوقف شد')), 10000)
      )
    ]);
    const component = (module as { default?: unknown }).default ?? module;
    remoteComponent.value = component;
    state.value = 'loaded';
    const meta = await loadRemoteMeta(props.remote);
    statusStore.markLoaded(props.remote, meta ?? undefined);
  } catch (error) {
    const rawMessage = (error as Error).message;
    const message = 'بارگذاری ریموت ناموفق بود';
    errorMessage.value = message;
    state.value = 'error';
    statusStore.markFailed(props.remote, message);
    eventBus.emit('TOAST', { type: 'error', message: `بارگذاری ${title.value} ناموفق بود` });
    eventBus.emit('AUDIT_LOG', {
      id: `audit_${Date.now()}`,
      level: 'error',
      message: `بارگذاری ${title.value} ناموفق بود`,
      source: 'shell',
      timestamp: new Date().toISOString(),
      context: { remote: props.remote, error: rawMessage }
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
