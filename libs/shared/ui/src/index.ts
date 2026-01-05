import type { App } from 'vue';
import Antd from 'ant-design-vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import 'ant-design-vue/dist/reset.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import UiButton from './components/UiButton.vue';
import UiCard from './components/UiCard.vue';
import UiModal from './components/UiModal.vue';
import UiDataTable from './components/UiDataTable.vue';
import UiToastHost from './components/UiToastHost.vue';

export function installUi(app: App) {
  app.use(Antd);
  app.use(PrimeVue, { ripple: true });
  app.use(ToastService);
  app.component('UiButton', UiButton);
  app.component('UiCard', UiCard);
  app.component('UiModal', UiModal);
  app.component('UiDataTable', UiDataTable);
  app.component('UiToastHost', UiToastHost);
}

export { UiButton, UiCard, UiModal, UiDataTable, UiToastHost };
