import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { loadRuntimeConfig } from '@shared/config';
import { installUi } from '@shared/ui';
import { eventBus, setHostPinia, useHostThemeStore } from '@shared/store';
import '@shared/styles';

async function bootstrap() {
  await loadRuntimeConfig();
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  setHostPinia(pinia);
  app.use(router);
  installUi(app);

  const themeStore = useHostThemeStore();
  themeStore.setMode(themeStore.mode);
  eventBus.on('NAVIGATE', ({ path }) => {
    router.push(path);
  });
  eventBus.on('AUTH_LOGOUT', () => {
    router.push('/login');
  });

  app.mount('#app');
}

bootstrap();
