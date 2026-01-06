<template>
  <UiPage>
    <UiPageHeader title="Login" subtitle="Select a role to enter the demo" />
    <UiSection>
      <form class="form" @submit.prevent="handleLogin">
        <label>
          Username
          <input v-model="username" type="text" placeholder="admin or user" />
        </label>
        <label>
          Role
          <select v-model="role">
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="reviewer">Reviewer</option>
            <option value="ops">Ops</option>
            <option value="user">User</option>
          </select>
        </label>
        <UiButton type="primary" html-type="submit">Sign in</UiButton>
      </form>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@shared/auth';

const router = useRouter();
const username = ref('admin');
const role = ref('admin');

const handleLogin = async () => {
  await login(username.value, role.value);
  await router.push('/');
};
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
</style>
