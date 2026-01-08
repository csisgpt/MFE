<template>
  <PageShell>
    <PageHeader title="مدیریت عملیات" subtitle="فلگ‌های ویژگی و کنترل ریموت‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'عملیات' }, { label: 'مدیریت' }]" />
      </template>
    </PageHeader>
    <div class="card">
      <p v-if="!isAdmin" class="warning">مجوز مدیر لازم است.</p>
      <div v-else class="space-y-3">
        <h4 class="font-semibold">فلگ‌های ویژگی</h4>
        <ul class="space-y-1 text-sm text-[var(--color-text-muted)]">
          <li v-for="(value, key) in flags" :key="key">
            {{ flagLabels[key] ?? 'نامشخص' }}: {{ value ? 'روشن' : 'خاموش' }}
          </li>
        </ul>
      </div>
    </div>
  </PageShell>
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
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.warning {
  color: #dc2626;
}
</style>
