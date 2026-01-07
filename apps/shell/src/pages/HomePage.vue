<template>
  <UiPage>
    <UiPageHeader title="داشبورد شِل" subtitle="مرکز مدیریت ماژول‌های سازمانی" />
    <div class="grid">
      <UiCard>
        <h3>دسترسی سریع</h3>
        <div class="links">
          <RouterLink to="/insurance">بیمه</RouterLink>
          <RouterLink to="/admission">پذیرش</RouterLink>
          <RouterLink to="/ops">عملیات</RouterLink>
          <RouterLink to="/system">سامانه</RouterLink>
          <RouterLink to="/audit">ممیزی</RouterLink>
        </div>
      </UiCard>
      <UiCard>
        <h3>وضعیت احراز هویت</h3>
        <p v-if="authStore.token?.length > 0">وارد شده با نام {{ authStore.user?.name }}</p>
        <p v-else>احراز هویت نشده</p>
      </UiCard>
      <UiCard >
        <h3 class="!bg-primary">پیکربندی زمان اجرا</h3>
        <ul>
          <li>نشانی رابط برنامه‌نویسی: تنظیم‌شده</li>
          <li class="!break-all">
            فلگ‌های ویژگی:
            <ul>
              <li v-for="flag in featureFlags" :key="flag.key">
                {{ flag.label }}: {{ flag.value ? 'فعال' : 'غیرفعال' }}
              </li>
            </ul>
          </li>
          <li class="!break-all">
            پیشوند ریموت‌ها:
            <ul>
              <li v-for="remote in remotePrefixes" :key="remote.id">
                {{ remote.title }}: {{ remote.prefixDisplay }}
              </li>
            </ul>
          </li>
        </ul>
      </UiCard>
    </div>
  </UiPage>
</template>

<script setup lang="ts">
import { getConfig, REMOTE_REGISTRY } from '@shared/config';
import { useHostAuthStore } from '@shared/store';

const authStore = useHostAuthStore();
const config = getConfig();
const featureFlags = [
  { key: 'enableReports', label: 'فعال‌سازی گزارش‌ها', value: config.featureFlags.enableReports },
  { key: 'disableInsurance', label: 'غیرفعال‌سازی بیمه', value: config.featureFlags.disableInsurance },
  { key: 'disableAdmission', label: 'غیرفعال‌سازی پذیرش', value: config.featureFlags.disableAdmission },
  { key: 'disableOps', label: 'غیرفعال‌سازی عملیات', value: config.featureFlags.disableOps }
];
const remotePrefixes = REMOTE_REGISTRY.map((remote) => ({
  id: remote.id,
  title: remote.titleFa,
  prefixDisplay: `/ریموت‌ها/${remote.titleFa}`
}));
</script>

<style scoped>
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
</style>
