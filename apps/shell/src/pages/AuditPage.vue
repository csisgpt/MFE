<template>
  <PageShell>
    <PageHeader title="ممیزی" subtitle="تاریخچه درخواست‌ها، رویدادها و خطاها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'خانه', to: '/' }, { label: 'ممیزی' }]" />
      </template>
    </PageHeader>
    <div class="card space-y-4">
      <div class="filters">
        <input
          v-model="search"
          class="input"
          type="text"
          placeholder="جستجو در پیام یا منبع"
        />
        <select v-model="level" class="input">
          <option value="all">همه سطوح</option>
          <option value="info">اطلاعات</option>
          <option value="error">خطا</option>
        </select>
        <button class="action-button" type="button" @click="auditStore.clear">پاک کردن</button>
      </div>
      <EnterpriseDataGrid
        v-if="localizedEntries.length"
        :row-data="localizedEntries"
        :column-defs="columnDefs"
        :pagination-page-size="6"
      />
      <EmptyState v-else title="رویدادی ثبت نشده است" description="هنوز داده‌ای برای ممیزی در دسترس نیست." />
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useHostAuditStore } from '@shared/store';
import type { ColDef } from 'ag-grid-community';

const auditStore = useHostAuditStore();
const search = ref('');
const level = ref('all');

const columnDefs: ColDef[] = [
  { field: 'timestampLabel', headerName: 'زمان' },
  { field: 'levelLabel', headerName: 'سطح' },
  { field: 'sourceLabel', headerName: 'منبع' },
  { field: 'message', headerName: 'پیام', flex: 1 }
];

const filteredEntries = computed(() =>
  auditStore.entries.filter((entry) => {
    const matchesLevel = level.value === 'all' || entry.level === level.value;
    const matchesSearch =
      entry.message.toLowerCase().includes(search.value.toLowerCase()) ||
      entry.source.toLowerCase().includes(search.value.toLowerCase());
    return matchesLevel && matchesSearch;
  })
);

const formatTimestamp = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('fa-IR');
};

const localizedEntries = computed(() =>
  filteredEntries.value.map((entry) => ({
    ...entry,
    levelLabel: entry.level === 'info' ? 'اطلاعات' : 'خطا',
    timestampLabel: formatTimestamp(entry.timestamp),
    sourceLabel:
      {
        shell: 'شل',
        system: 'سامانه',
        'http-client': 'کلاینت رابط برنامه‌نویسی',
        'api-client': 'کلاینت رابط برنامه‌نویسی',
        'app-one': 'اپلیکیشن یک',
        'app-two': 'اپلیکیشن دو',
        insurance: 'بیمه',
        'insurance-admin': 'مدیریت بیمه',
        admission: 'پذیرش',
        ops: 'عملیات'
      }[entry.source] ?? 'سایر'
  }))
);
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.filters {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.input {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}
</style>
