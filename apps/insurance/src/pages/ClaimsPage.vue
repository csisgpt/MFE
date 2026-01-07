<template>
  <UiPage>
    <UiPageHeader title="خسارت‌ها" subtitle="خسارت‌های ثبت‌شده توسط تیم شما">
      <template #actions>
        <UiButton type="primary" @click="navigate('claims/create')">خسارت جدید</UiButton>
      </template>
    </UiPageHeader>
    <UiSection>
      <UiDataTable :value="claims" :columns="columns" />
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getClaims } from '@shared/api-client';

const router = useRouter();
const claims = ref([]);
const columns = [
  { field: 'id', header: 'شناسه خسارت' },
  { field: 'policyId', header: 'بیمه‌نامه' },
  { field: 'status', header: 'وضعیت' },
  { field: 'amount', header: 'مبلغ' }
];

const navigate = (target: string) => {
  router.push(`/insurance/${target}`);
};

onMounted(async () => {
  claims.value = await getClaims();
});
</script>
