<template>
  <div class="flex min-h-screen items-center justify-center bg-[var(--color-surface-muted)] px-4 py-10" dir="rtl">
    <div class="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <UiIcon name="apps" :size="24" />
        </div>
        <div>
          <h1 class="text-lg font-semibold text-[var(--color-text)]">ورود به سامانه</h1>
          <p class="text-sm text-[var(--color-text-muted)]">اطلاعات کاربری خود را وارد کنید</p>
        </div>
      </div>
      <form class="mt-6 flex flex-col gap-4" @submit.prevent="handleLogin">
        <label class="flex flex-col gap-2 text-sm text-[var(--color-text)]">
          نام کاربری
          <input
            v-model.trim="username"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            type="text"
            placeholder="برای مثال: مدیر"
          />
        </label>
        <label class="flex flex-col gap-2 text-sm text-[var(--color-text)]">
          گذرواژه
          <input
            v-model.trim="password"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            type="password"
            placeholder="برای مثال: ۱۲۳۴"
          />
        </label>
        <label class="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <input v-model="remember" type="checkbox" class="h-4 w-4" />
          مرا به خاطر بسپار
        </label>
        <p class="text-xs text-[var(--color-text-muted)]">
          نمونه ورود: نام کاربری «مدیر» و گذرواژه ۱۲۳۴
        </p>
        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>
        <button
          class="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-contrast)] disabled:opacity-60"
          :disabled="loading"
          type="submit"
        >
          {{ loading ? 'در حال ورود...' : 'ورود' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getRedirectPath, login } from '@shared/auth';

const router = useRouter();
const username = ref('');
const password = ref('');
const remember = ref(true);
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  if (!username.value || !password.value) {
    errorMessage.value = 'نام کاربری و گذرواژه الزامی است.';
    return;
  }
  loading.value = true;
  try {
    await login(username.value, password.value, remember.value);
    const redirect = getRedirectPath();
    await router.push(redirect || '/');
  } catch (error) {
    errorMessage.value = (error as Error).message || 'ورود ناموفق بود. دوباره تلاش کنید.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.error-box {
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--color-danger) 40%, var(--color-border));
  background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
  padding: 8px 12px;
  font-size: 12px;
  color: var(--color-danger);
}
</style>
