<template>
  <PageShell>
    <!-- <PageHeader :title="title" :subtitle="subtitle">
      <template #actions>
        <button class="action-button" type="button" @click="loadRemote">تلاش دوباره</button>
      </template>
    </PageHeader> -->
    <div v-if="state === 'loading'" class="card space-y-3">
      <SkeletonBlock height="18px" />
      <SkeletonBlock height="120px" />
    </div>
    <EmptyState
      v-else-if="state === 'disabled'"
      title="ریموت غیرفعال است"
      description="این ریموت با فلگ‌های ویژگی غیرفعال شده است. آن را در بخش تنظیمات سیستم فعال کنید."
    />
    <EmptyState v-else-if="state === 'error'" title="بارگذاری ناموفق" :description="errorMessage">
      <button class="action-button" type="button" @click="loadRemote">تلاش دوباره</button>
    </EmptyState>
    <component v-else :is="remoteComponent" />
  </PageShell>
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
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}
</style>
