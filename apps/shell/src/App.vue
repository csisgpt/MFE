<template>
  <div class="shell">
    <aside :class="['sidebar', { open: sidebarOpen }]">
      <div class="brand">CSIS MFE</div>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">Dashboard</RouterLink>
        <RouterLink
          to="/insurance"
          class="nav-link"
          @mouseenter="prefetchRemoteEntry('insurance')"
        >
          Insurance
        </RouterLink>
        <RouterLink
          to="/admission"
          class="nav-link"
          @mouseenter="prefetchRemoteEntry('admission')"
        >
          Admission
        </RouterLink>
        <RouterLink to="/ops" class="nav-link" @mouseenter="prefetchRemoteEntry('ops')">Ops</RouterLink>
        <RouterLink
          to="/app-one"
          class="nav-link"
          @mouseenter="prefetchRemoteEntry('appOne')"
        >
          App One
        </RouterLink>
        <RouterLink
          to="/app-two"
          class="nav-link"
          @mouseenter="prefetchRemoteEntry('appTwo')"
        >
          App Two
        </RouterLink>
        <RouterLink to="/settings" class="nav-link">Settings</RouterLink>
        <RouterLink to="/profile" class="nav-link">Profile</RouterLink>
        <RouterLink to="/system" class="nav-link">System</RouterLink>
        <RouterLink to="/audit" class="nav-link">Audit</RouterLink>
      </nav>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="menu-button" @click="sidebarOpen = !sidebarOpen">☰</button>
        <div class="topbar-actions">
          <div class="user-block" v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <UiSelect
              v-model:value="selectedRole"
              :options="roleOptions"
              size="small"
              data-testid="role-switch"
            />
          </div>
          <UiButton size="small" @click="themeStore.toggle">
            Theme: {{ themeStore.mode }}
          </UiButton>
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useHostAuthStore, useHostThemeStore } from '@shared/store';
import { logout } from '@shared/auth';
import { prefetchRemoteEntry } from './utils/remotes';

const authStore = useHostAuthStore();
const themeStore = useHostThemeStore();
const sidebarOpen = ref(false);

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Employee', value: 'employee' },
  { label: 'Reviewer', value: 'reviewer' },
  { label: 'Ops', value: 'ops' },
  { label: 'User', value: 'user' }
];

const selectedRole = ref(authStore.user?.role ?? 'user');

watch(
  () => authStore.user?.role,
  (role) => {
    if (role) {
      selectedRole.value = role;
    }
  }
);

watch(selectedRole, (role) => {
  if (authStore.user && role !== authStore.user.role) {
    authStore.setRole(role);
  }
});

const handleLogout = () => {
  logout();
};
</script>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-surface-muted);
}

.sidebar {
  width: 240px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand {
  font-weight: 700;
  font-size: 18px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  padding: 8px 12px;
  border-radius: var(--radius-md);
}

.nav-link.router-link-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.menu-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: none;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 600;
}

.content {
  padding: 24px;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: -260px;
    top: 0;
    height: 100%;
    z-index: 10;
    transition: left 0.2s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .menu-button {
    display: inline-flex;
  }

  .main {
    margin-left: 0;
  }
}
</style>
