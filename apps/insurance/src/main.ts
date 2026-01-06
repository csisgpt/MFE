import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { installUi } from '@shared/ui';
import { setHostPinia, useHostThemeStore } from '@shared/store';
import '@shared/styles';
import { createRouter, createWebHistory } from 'vue-router';
import InsuranceMount from './InsuranceMount.vue';

if (import.meta.env.VITE_STANDALONE) {
  import('@shared/ui/styles');
}

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/insurance/:catchAll(.*)*', component: InsuranceMount },
    { path: '/:pathMatch(.*)*', redirect: '/insurance' }
  ]
});
app.use(pinia);
setHostPinia(pinia);
app.use(router);
installUi(app);
const themeStore = useHostThemeStore();
themeStore.setMode(themeStore.mode);
app.mount('#app');
