import type { App } from 'vue';
import Antd from 'ant-design-vue';
import faIR from 'ant-design-vue/es/locale/fa_IR';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

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
import AppLayout from './components/AppLayout.vue';
import HeaderBar from './components/HeaderBar.vue';
import SidebarNav from './components/SidebarNav.vue';
import Breadcrumbs from './components/Breadcrumbs.vue';
import PageHeader from './components/PageHeader.vue';
import PageShell from './components/PageShell.vue';
import EmptyState from './components/EmptyState.vue';
import SkeletonBlock from './components/SkeletonBlock.vue';
import UiIcon from './components/UiIcon.vue';
import EnterpriseDataGrid from './components/EnterpriseDataGrid.vue';
import MainTable from './components/data-grid/data-grid.vue';

export function installUi(app: App) {
  app.use(Antd, { locale: faIR });
  app.use(PrimeVue, {
    ripple: true,
    locale: {
      startsWith: 'شروع با',
      contains: 'شامل',
      notContains: 'شامل نیست',
      endsWith: 'پایان با',
      equals: 'برابر با',
      notEquals: 'نابرابر با',
      noFilter: 'بدون فیلتر',
      lt: 'کمتر از',
      lte: 'کمتر یا مساوی',
      gt: 'بیشتر از',
      gte: 'بیشتر یا مساوی',
      dateIs: 'تاریخ برابر است با',
      dateIsNot: 'تاریخ برابر نیست با',
      dateBefore: 'قبل از تاریخ',
      dateAfter: 'بعد از تاریخ',
      clear: 'پاک کردن',
      apply: 'اعمال',
      matchAll: 'مطابقت همه',
      matchAny: 'مطابقت هرکدام',
      addRule: 'افزودن قانون',
      removeRule: 'حذف قانون',
      accept: 'تایید',
      reject: 'رد',
      choose: 'انتخاب',
      upload: 'بارگذاری',
      cancel: 'انصراف',
      dayNames: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
      dayNamesShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه'],
      dayNamesMin: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
      monthNames: [
        'فروردین',
        'اردیبهشت',
        'خرداد',
        'تیر',
        'مرداد',
        'شهریور',
        'مهر',
        'آبان',
        'آذر',
        'دی',
        'بهمن',
        'اسفند'
      ],
      monthNamesShort: [
        'فرو',
        'ارد',
        'خرد',
        'تیر',
        'مرد',
        'شهر',
        'مهر',
        'آبا',
        'آذر',
        'دی',
        'بهم',
        'اسف'
      ],
      today: 'امروز',
      weekHeader: 'هفته',
      firstDayOfWeek: 6,
      dateFormat: 'yy/mm/dd',
      emptyMessage: 'موردی یافت نشد',
      emptyFilterMessage: 'نتیجه‌ای برای فیلتر یافت نشد',
      emptySearchMessage: 'نتیجه‌ای یافت نشد',
      firstPageLabel: 'اولین صفحه',
      lastPageLabel: 'آخرین صفحه',
      nextPageLabel: 'صفحه بعد',
      prevPageLabel: 'صفحه قبل',
      rowsPerPageLabel: 'تعداد در صفحه',
      jumpToPageDropdownLabel: 'پرش به صفحه',
      jumpToPageInputLabel: 'شماره صفحه'
    },
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: 'system',
        cssLayer: false
      }
    }
  });
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
  app.component('AppLayout', AppLayout);
  app.component('HeaderBar', HeaderBar);
  app.component('SidebarNav', SidebarNav);
  app.component('Breadcrumbs', Breadcrumbs);
  app.component('PageHeader', PageHeader);
  app.component('PageShell', PageShell);
  app.component('EmptyState', EmptyState);
  app.component('SkeletonBlock', SkeletonBlock);
  app.component('UiIcon', UiIcon);
  app.component('MainTable', MainTable);
  app.component('EnterpriseDataGrid', EnterpriseDataGrid);
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
  UiTag,
  AppLayout,
  HeaderBar,
  SidebarNav,
  Breadcrumbs,
  PageHeader,
  PageShell,
  EmptyState,
  SkeletonBlock,
  UiIcon,
  EnterpriseDataGrid, 
  MainTable
};
