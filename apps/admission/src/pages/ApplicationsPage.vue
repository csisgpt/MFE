<template>
  <UiPage>
    <UiPageHeader title="درخواست‌ها" subtitle="مدیریت فرایند متقاضیان" />
    <UiSection>
      <div class="filters">
        <UiInput v-model:value="store.filter" placeholder="فیلتر بر اساس وضعیت" />
      </div>
      <UiDataTable :value="filtered" :columns="columns" @row-click="handleRowClick" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAdmissionApplications } from '@shared/api-client';
import { useAdmissionStore } from '../stores/admission.store';

const router = useRouter();
const store = useAdmissionStore();
const applications = ref([]);

const columns = [
  { field: 'id', header: 'شناسه' },
  { field: 'applicantName', header: 'متقاضی' },
  { field: 'program', header: 'رشته' },
  { field: 'status', header: 'وضعیت' }
];

const filtered = computed(() =>
  applications.value.filter((item: { status: string }) => item.status.includes(store.filter))
);

const handleRowClick = (event: { data: { id: string } }) => {
  router.push(`/admission/applications/${event.data.id}`);
};

onMounted(async () => {
  applications.value = await getAdmissionApplications();
});
</script>

<style scoped>
.filters {
  margin-bottom: 12px;
}
</style>
