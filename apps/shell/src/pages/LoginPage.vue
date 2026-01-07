<template>
  <UiPage>
    <UiPageHeader title="ورود" subtitle="برای ورود نقش را انتخاب کنید" />
    <UiSection>
      <form class="form" @submit.prevent="handleLogin">
        <label>
          نام کاربری
          <input v-model="username" type="text" placeholder="برای نمونه: مدیر" />
        </label>
        <label>
          نقش
          <select v-model="role">
            <option value="admin">مدیر</option>
            <option value="employee">کارمند</option>
            <option value="reviewer">بازبین</option>
            <option value="ops">عملیات</option>
            <option value="user">کاربر</option>
          </select>
        </label>
        <UiButton type="primary" html-type="submit">ورود</UiButton>
      </form>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@shared/auth';

const router = useRouter();
const username = ref('مدیر');
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
