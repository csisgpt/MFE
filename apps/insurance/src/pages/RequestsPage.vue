<template>
  <UiPage>
    <UiPageHeader title="درخواست‌های بیمه" subtitle="پیگیری درخواست‌های ثبت‌شده">
      <template #actions>
        <UiButton type="primary" @click="navigate('requests/create')">درخواست جدید</UiButton>
      </template>
    </UiPageHeader>
    <UiSection title="درخواست‌ها">
      <div class="filters">
        <UiInput v-model:value="store.requestFilter" placeholder="فیلتر بر اساس وضعیت" />
      </div>
      <UiDataTable :value="filtered" :columns="columns" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getInsuranceRequests } from '@shared/api-client';
import { useInsuranceStore } from '../stores/insurance.store';

const router = useRouter();
const store = useInsuranceStore();
const requests = ref<{ id: string; status: string; type: string; amount: number; employeeName: string }[]>(
  []
);

const columns = [
  { field: 'id', header: 'شناسه درخواست' },
  { field: 'employeeName', header: 'کارمند' },
  { field: 'type', header: 'نوع' },
  { field: 'status', header: 'وضعیت' },
  { field: 'amount', header: 'مبلغ' }
];

const filtered = computed(() =>
  requests.value.filter((item) => item.status.includes(store.requestFilter))
);

const navigate = (target: string) => {
  router.push(`/insurance/${target}`);
};

onMounted(async () => {
  requests.value = await getInsuranceRequests();
});
</script>

<style scoped>
.filters {
  margin-bottom: 12px;
}
</style>
