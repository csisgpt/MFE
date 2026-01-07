<template>
  <PageShell>
    <PageHeader title="کاربران" subtitle="فهرست کاربران سامانه">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'اپلیکیشن دو' }, { label: 'کاربران' }]" />
      </template>
      <template #actions>
        <button class="action-button" type="button" @click="appTwoStore.showUserModal = true">
          افزودن کاربر
        </button>
      </template>
    </PageHeader>
    <div class="card">
      <EnterpriseDataGrid :row-data="users" :column-defs="columns" :pagination-page-size="5" />
    </div>
    <UiModal v-model:open="appTwoStore.showUserModal" title="افزودن کاربر" @ok="addUser">
      <div class="form">
        <label>
          نام
          <input v-model="appTwoStore.newUser.name" />
        </label>
        <label>
          نقش
          <select v-model="appTwoStore.newUser.role">
            <option value="مدیر">مدیر</option>
            <option value="کاربر">کاربر</option>
          </select>
        </label>
      </div>
    </UiModal>
  </PageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getUsers } from '@shared/api-client';
import { useAppTwoStore } from '../stores/app-two.store';
import type { ColDef } from 'ag-grid-community';

const users = ref<{ id: string; name: string; role: string }[]>([]);
const appTwoStore = useAppTwoStore();

const columns: ColDef[] = [
  { field: 'id', headerName: 'شناسه' },
  { field: 'name', headerName: 'نام' },
  { field: 'role', headerName: 'نقش' }
];

const addUser = () => {
  users.value = [
    ...users.value,
    {
      id: `کاربر-${users.value.length + 1}`,
      name: appTwoStore.newUser.name,
      role: appTwoStore.newUser.role
    }
  ];
  appTwoStore.resetUserDraft();
  appTwoStore.showUserModal = false;
};

onMounted(async () => {
  users.value = await getUsers();
});
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input,
select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}
</style>
