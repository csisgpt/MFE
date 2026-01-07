<template>
  <UiPage>
    <UiPageHeader title="بررسی درخواست‌ها" subtitle="تایید یا رد درخواست‌ها" />
    <UiSection>
      <UiDataTable :value="requests" :columns="columns" @row-click="handleRowClick" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getInsuranceRequests } from '@shared/api-client';

const emit = defineEmits<{ (e: 'open-request', id: string): void }>();

const requests = ref([]);
const columns = [
  { field: 'id', header: 'شناسه درخواست' },
  { field: 'employeeName', header: 'کارمند' },
  { field: 'status', header: 'وضعیت' },
  { field: 'amount', header: 'مبلغ' }
];

const handleRowClick = (event: { data: { id: string } }) => {
  emit('open-request', event.data.id);
};

onMounted(async () => {
  requests.value = await getInsuranceRequests();
});
</script>
