<template>
  <div class="app-one h-full flex flex-col">
    <!-- Top bar / breadcrumbs -->
    <div class="px-4 pt-3">
      <div class="text-xs text-text-muted">
        اپلیکیشن یک / {{ currentLabel }}
      </div>
    </div>

    <!-- Subnav -->
    <nav class="subnav px-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="tab transition-all"
        active-class="tab--active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Content -->
    <main class="grow px-4 pb-4">
      <Transition mode="out-in" name="slide-fade">
        <RouterView />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { RouterLink, RouterView, useRoute, routerKey } from 'vue-router';
import { buildAppOneNav } from './app.routes';
import { createAppOneRouter, useSyncShellCatchAllToLocalRouter } from './useAppOneRouter';

const props = defineProps<{ catchAll?: string | string[] }>();

// ✅ router داخلی
const localRouter = createAppOneRouter();
provide(routerKey, localRouter);

// ✅ sync مسیر shell به router داخلی
useSyncShellCatchAllToLocalRouter(localRouter, () => props.catchAll);

// ✅ nav از route meta
const navItems = computed(() => buildAppOneNav());

// ✅ breadcrumb label
const route = useRoute(); // این route مربوط به shell است
const currentLabel = computed(() => {
  const raw = props.catchAll;
  const s = Array.isArray(raw) ? raw.join('/') : (raw ?? '');
  const first = s.split('/').filter(Boolean)[0] ?? 'home';
  const map: Record<string, string> = { home: 'نمای کلی', users: 'کاربران', requests: 'درخواست‌ها' };
  return map[first] ?? 'نمای کلی';
});
</script>

<style scoped>
.subnav {
  display: flex;
  margin: 10px 0 16px;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid var(--color-border);
  padding: 6px 14px;
  border-radius: 0 0 12px 12px;
  background: var(--color-surface);
  text-decoration: none;
}

.tab--active {
  background: color-mix(in srgb, var(--color-primary) 20%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
  transform: scale(1.08);
  margin-top: 4px;
}
</style>
