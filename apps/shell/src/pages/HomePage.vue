<template>
  <PageShell>
    <PageHeader title="داشبورد مرکزی" subtitle="مرکز مدیریت ماژول‌های سازمانی">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'خانه' }]" />
      </template>
    </PageHeader>
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="card">
        <h3 class="text-sm font-semibold text-[var(--color-text)]">دسترسی سریع</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <RouterLink
            v-for="remote in enabledRemotes"
            :key="remote.id"
            :to="remote.basePath"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs"
          >
            {{ remote.titleFa }}
          </RouterLink>
        </div>
      </div>
      <div class="card">
        <h3 class="text-sm font-semibold text-[var(--color-text)]">وضعیت احراز هویت</h3>
        <p class="mt-3 text-sm text-[var(--color-text-muted)]">
          {{ authStore.token?.length ? `وارد شده با نام ${authStore.user?.name}` : 'احراز هویت نشده' }}
        </p>
      </div>
      <div class="card">
        <h3 class="text-sm font-semibold text-[var(--color-text)]">پیکربندی زمان اجرا</h3>
        <ul class="mt-3 space-y-2 text-xs text-[var(--color-text-muted)]">
          <li>نشانی رابط برنامه‌نویسی: تنظیم‌شده</li>
          <li>
            فلگ‌های ویژگی:
            <ul class="mt-2 space-y-1">
              <li v-for="flag in featureFlags" :key="flag.key">
                {{ flag.label }}: {{ flag.value ? 'فعال' : 'غیرفعال' }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { getConfig, getEnabledRemotes } from '@shared/config';
import { useHostAuthStore } from '@shared/store';

const authStore = useHostAuthStore();
const config = getConfig();
const enabledRemotes = getEnabledRemotes(config);
const featureFlags = [
  { key: 'enableReports', label: 'فعال‌سازی گزارش‌ها', value: config.featureFlags.enableReports },
  { key: 'disableInsurance', label: 'غیرفعال‌سازی بیمه', value: config.featureFlags.disableInsurance },
  { key: 'disableAdmission', label: 'غیرفعال‌سازی پذیرش', value: config.featureFlags.disableAdmission },
  { key: 'disableOps', label: 'غیرفعال‌سازی عملیات', value: config.featureFlags.disableOps }
];
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.grid {
  display: grid;
}
</style>
