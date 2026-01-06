<template>
  <UiPage>
    <UiPageHeader title="مدیریت عملیات" subtitle="فلگ‌های ویژگی و کنترل ریموت‌ها" />
    <UiSection>
      <p v-if="!isAdmin" class="warning">مجوز مدیر لازم است.</p>
      <div v-else>
        <h4>فلگ‌های ویژگی</h4>
        <ul>
          <li v-for="(value, key) in flags" :key="key">
            {{ flagLabels[key] ?? 'نامشخص' }}: {{ value ? 'روشن' : 'خاموش' }}
          </li>
        </ul>
      </div>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getConfig } from '@shared/config';
import { can } from '@shared/permissions';

const flags = getConfig().featureFlags;
const isAdmin = computed(() => can('ops:admin'));
const flagLabels: Record<string, string> = {
  enableReports: 'فعال‌سازی گزارش‌ها',
  disableInsurance: 'غیرفعال‌سازی بیمه',
  disableAdmission: 'غیرفعال‌سازی پذیرش',
  disableOps: 'غیرفعال‌سازی عملیات'
};
</script>

<style scoped>
.warning {
  color: #dc2626;
}
</style>
