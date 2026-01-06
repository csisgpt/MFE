<template>
  <UiPage>
    <UiPageHeader title="Claims" subtitle="Claims submitted by your team">
      <template #actions>
        <UiButton type="primary" @click="navigate('claims/create')">New claim</UiButton>
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
  { field: 'id', header: 'Claim ID' },
  { field: 'policyId', header: 'Policy' },
  { field: 'status', header: 'Status' },
  { field: 'amount', header: 'Amount' }
];

const navigate = (target: string) => {
  router.push(`/insurance/${target}`);
};

onMounted(async () => {
  claims.value = await getClaims();
});
</script>
