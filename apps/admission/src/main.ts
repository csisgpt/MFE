import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { installUi } from '@shared/ui';
import { setHostPinia, useHostThemeStore } from '@shared/store';
import '@shared/styles/tokens';
import '@shared/styles/base';
import { createRouter, createWebHistory } from 'vue-router';
import AdmissionMount from './AdmissionMount.vue';

if (import.meta.env.VITE_STANDALONE) {
  import('@shared/ui/styles');
}

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/admission/:catchAll(.*)*', component: AdmissionMount },
    { path: '/:pathMatch(.*)*', redirect: '/admission' }
  ]
});
app.use(pinia);
setHostPinia(pinia);
app.use(router);
installUi(app);
const themeStore = useHostThemeStore();
themeStore.setMode(themeStore.mode);
app.mount('#app');
