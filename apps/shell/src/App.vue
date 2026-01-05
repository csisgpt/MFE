<template>
  <div class="layout">
    <header class="topbar">
      <div class="brand">CSIS Shell</div>
      <nav class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/app-one">App One</RouterLink>
        <RouterLink to="/app-two">App Two</RouterLink>
        <RouterLink to="/settings">Settings</RouterLink>
        <RouterLink to="/profile">Profile</RouterLink>
      </nav>
      <div class="auth-actions">
        <span v-if="authStore.isAuthenticated">Hi, {{ authStore.user?.name }}</span>
        <UiButton v-if="authStore.isAuthenticated" type="primary" size="small" @click="handleLogout">
          Logout
        </UiButton>
        <RouterLink v-else to="/login">Login</RouterLink>
      </div>
    </header>
    <main class="content">
      <RouterView />
    </main>
    <UiToastHost />
  </div>
</template>

<script setup lang="ts">
import { useHostAuthStore } from '@shared/store';
import { logout } from '@shared/auth';

const authStore = useHostAuthStore();

const handleLogout = () => {
  logout();
};
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--color-surface-muted);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.brand {
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 12px;
}

.nav-links a.router-link-active {
  color: var(--color-primary);
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content {
  padding: 24px;
}
</style>
