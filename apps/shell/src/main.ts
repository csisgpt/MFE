import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { getConfig, loadRuntimeConfig, REMOTE_REGISTRY } from '@shared/config';
import '@shared/styles/tokens';
import '@shared/styles/base';
import { installUi } from '@shared/ui';
import '@shared/ui/styles';
import { eventBus, setHostPinia, useHostAuditStore, useHostThemeStore } from '@shared/store';
import { useRemoteStatusStore, type RemoteKey } from './stores/remote-status.store';

async function bootstrap() {
  await loadRuntimeConfig();
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  setHostPinia(pinia);
  app.use(router);
  installUi(app);

  const themeStore = useHostThemeStore();
  const auditStore = useHostAuditStore();
  const remoteStore = useRemoteStatusStore();
  themeStore.setMode(themeStore.mode);
  const config = getConfig();
  const disabledMap = REMOTE_REGISTRY.reduce<Partial<Record<RemoteKey, boolean>>>((acc, remote) => {
    if (remote.disabledFlag && config.featureFlags[remote.disabledFlag]) {
      acc[remote.id] = true;
    }
    return acc;
  }, {});
  remoteStore.seedFromRuntimeConfig(disabledMap);
  remoteStore.loadDisabledFromStorage();
  eventBus.on('NAVIGATE', ({ path }) => {
    router.push(path);
  });
  eventBus.on('AUTH_LOGOUT', () => {
    router.push('/login');
  });
  eventBus.on('AUDIT_LOG', (entry) => {
    auditStore.add(entry);
  });

  window.addEventListener('error', (event) => {
    auditStore.add({
      id: `err_${Date.now()}`,
      level: 'error',
      message: event.message || 'خطای غیرمنتظره در شِل',
      source: 'shell',
      timestamp: new Date().toISOString(),
      context: { filename: event.filename, lineno: event.lineno }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    auditStore.add({
      id: `rej_${Date.now()}`,
      level: 'error',
      message: 'رد شدن وعده بدون مدیریت',
      source: 'shell',
      timestamp: new Date().toISOString(),
      context: { reason: String(event.reason) }
    });
  });

  app.mount('#app');
}

bootstrap();
