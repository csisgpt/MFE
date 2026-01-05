import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { installUi } from '@shared/ui';
import { setHostPinia, useHostThemeStore } from '@shared/store';
import '@shared/styles';
import { createRouter, createWebHistory } from 'vue-router';
import AppOneMount from './AppOneMount.vue';

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/app-one/:catchAll(.*)*', component: AppOneMount },
    { path: '/:pathMatch(.*)*', redirect: '/app-one' }
  ]
});
app.use(pinia);
setHostPinia(pinia);
app.use(router);
installUi(app);
const themeStore = useHostThemeStore();
themeStore.setMode(themeStore.mode);
app.mount('#app');
