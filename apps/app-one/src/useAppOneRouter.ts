import { computed, ref, watch } from 'vue';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import { APP_ONE_LOCAL_ROUTES } from './app.routes';
import { eventBus } from '@shared/store';

export function createAppOneLocalRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: APP_ONE_LOCAL_ROUTES
  });
}

/**
 * bridge بین host url (/app-one/...) و local router (/users,...)
 */
export function bridgeHostAndLocalRouter(opts: {
  localRouter: Router;
  getHostCatchAll: () => string | string[] | undefined;
  hostBasePath?: string; // default: /app-one
}) {
  const { localRouter, getHostCatchAll, hostBasePath = '/app-one' } = opts;

  const syncingFromHost = ref(false);

  // host -> local
  const localTarget = computed(() => {
    const raw = getHostCatchAll();
    const s = Array.isArray(raw) ? raw.join('/') : (raw ?? '');
    return '/' + (s || 'home'); // /app-one => /home
  });

  watch(
    localTarget,
    async (p) => {
      syncingFromHost.value = true;
      try {
        if (localRouter.currentRoute.value.fullPath !== p) {
          await localRouter.replace(p);
        }
      } finally {
        syncingFromHost.value = false;
      }
    },
    { immediate: true }
  );

  // local -> host (برای اینکه URL و breadcrumb shell هم درست بمونه)
  localRouter.afterEach((to) => {
    if (syncingFromHost.value) return;

    const local = to.fullPath; // /home | /users | ...
    const hostPath =
      local === '/home' || local === '/'
        ? hostBasePath
        : `${hostBasePath}${local}`;

    eventBus.emit('NAVIGATE', { path: hostPath });
  });
}
