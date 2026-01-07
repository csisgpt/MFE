<template>
  <UiCard>
    <div class="header">
      <h3>کاربران</h3>
      <UiButton type="primary" @click="appTwoStore.showUserModal = true">افزودن کاربر</UiButton>
    </div>
    <UiDataTable :value="users" :columns="columns" />
  </UiCard>
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
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getUsers } from '@shared/api-client';
import { useAppTwoStore } from '../stores/app-two.store';

const users = ref<{ id: string; name: string; role: string }[]>([]);
const appTwoStore = useAppTwoStore();

const columns = [
  { field: 'id', header: 'شناسه' },
  { field: 'name', header: 'نام' },
  { field: 'role', header: 'نقش' }
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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
</style>
