<template>
  <UiPage>
    <UiPageHeader title="ممیزی" subtitle="تاریخچه درخواست‌ها، رویدادها و خطاها" />
    <UiSection title="فیلترها">
      <div class="filters">
        <UiInput v-model:value="search" placeholder="جستجو در پیام یا منبع" />
        <UiSelect v-model:value="level" :options="levelOptions" placeholder="سطح" />
        <UiButton size="small" @click="auditStore.clear">پاک کردن</UiButton>
      </div>
    </UiSection>
    <UiSection title="رویدادها">
      <UiDataTable :value="localizedEntries" :columns="columns" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useHostAuditStore } from '@shared/store';

const auditStore = useHostAuditStore();
const search = ref('');
const level = ref('all');

const levelOptions = [
  { label: 'همه سطوح', value: 'all' },
  { label: 'اطلاعات', value: 'info' },
  { label: 'خطا', value: 'error' }
];

const columns = [
  { field: 'timestampLabel', header: 'زمان' },
  { field: 'levelLabel', header: 'سطح' },
  { field: 'sourceLabel', header: 'منبع' },
  { field: 'message', header: 'پیام' }
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
.filters {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
</style>
