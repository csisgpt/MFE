import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { getConfig, loadRuntimeConfig } from '@shared/config';
import { installUi } from '@shared/ui';
import '@shared/ui/styles';
import { eventBus, setHostPinia, useHostAuditStore, useHostThemeStore } from '@shared/store';
import '@shared/styles';
import { useRemoteStatusStore } from './stores/remote-status.store';

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
  remoteStore.seedFromRuntimeConfig({
    insurance: config.featureFlags.disableInsurance,
    admission: config.featureFlags.disableAdmission,
    ops: config.featureFlags.disableOps
  });
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
      message: event.message,
      source: 'shell',
      timestamp: new Date().toISOString(),
      context: { filename: event.filename, lineno: event.lineno }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    auditStore.add({
      id: `rej_${Date.now()}`,
      level: 'error',
      message: 'Unhandled promise rejection',
      source: 'shell',
      timestamp: new Date().toISOString(),
      context: { reason: String(event.reason) }
    });
  });

  app.mount('#app');
}

bootstrap();
