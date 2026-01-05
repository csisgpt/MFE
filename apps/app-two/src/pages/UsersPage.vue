<template>
  <UiCard>
    <div class="header">
      <h3>Users</h3>
      <UiButton type="primary" @click="showModal = true">Add User</UiButton>
    </div>
    <UiDataTable :value="users" :columns="columns" />
  </UiCard>
  <UiModal v-model:open="showModal" title="Add User" @ok="addUser">
    <div class="form">
      <label>
        Name
        <input v-model="newUser.name" />
      </label>
      <label>
        Role
        <select v-model="newUser.role">
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </label>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getUsers } from '@shared/api-client';

const users = ref<{ id: string; name: string; role: string }[]>([]);
const showModal = ref(false);
const newUser = ref({ name: '', role: 'user' });

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'name', header: 'Name' },
  { field: 'role', header: 'Role' }
];

const addUser = () => {
  users.value = [
    ...users.value,
    { id: `u${users.value.length + 1}`, name: newUser.value.name, role: newUser.value.role }
  ];
  newUser.value = { name: '', role: 'user' };
  showModal.value = false;
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
