<template>
  <UiCard class="card">
    <h2>Login</h2>
    <form class="form" @submit.prevent="handleLogin">
      <label>
        Username
        <input v-model="username" type="text" placeholder="admin or user" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" placeholder="password" />
      </label>
      <UiButton type="primary" html-type="submit">Sign in</UiButton>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@shared/auth';

const router = useRouter();
const username = ref('admin');
const password = ref('');

const handleLogin = async () => {
  await login(username.value, password.value);
  await router.push('/');
};
</script>

<style scoped>
.card {
  max-width: 400px;
}

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
</style>
