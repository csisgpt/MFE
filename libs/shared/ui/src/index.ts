import type { App } from 'vue';
import Antd from 'ant-design-vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import UiButton from './components/UiButton.vue';
import UiCard from './components/UiCard.vue';
import UiModal from './components/UiModal.vue';
import UiDataTable from './components/UiDataTable.vue';
import UiToastHost from './components/UiToastHost.vue';
import UiPage from './components/UiPage.vue';
import UiPageHeader from './components/UiPageHeader.vue';
import UiSection from './components/UiSection.vue';
import UiInput from './components/UiInput.vue';
import UiSelect from './components/UiSelect.vue';
import UiForm from './components/UiForm.vue';
import UiFormItem from './components/UiFormItem.vue';
import UiTag from './components/UiTag.vue';

export function installUi(app: App) {
  app.use(Antd);
  app.use(PrimeVue, { ripple: true });
  app.use(ToastService);
  app.component('UiButton', UiButton);
  app.component('UiCard', UiCard);
  app.component('UiModal', UiModal);
  app.component('UiDataTable', UiDataTable);
  app.component('UiToastHost', UiToastHost);
  app.component('UiPage', UiPage);
  app.component('UiPageHeader', UiPageHeader);
  app.component('UiSection', UiSection);
  app.component('UiInput', UiInput);
  app.component('UiSelect', UiSelect);
  app.component('UiForm', UiForm);
  app.component('UiFormItem', UiFormItem);
  app.component('UiTag', UiTag);
}

export {
  UiButton,
  UiCard,
  UiModal,
  UiDataTable,
  UiToastHost,
  UiPage,
  UiPageHeader,
  UiSection,
  UiInput,
  UiSelect,
  UiForm,
  UiFormItem,
  UiTag
};
