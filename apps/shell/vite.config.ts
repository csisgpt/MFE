// apps/shell/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import { REMOTE_REGISTRY, getRemoteEntryUrl } from '../../libs/shared/config/src/registry';
import { createMockApi } from './tools/mock-api';
import { getSharedAliases, getWorkspaceRoot } from '../../tools/vite/shared-aliases';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: [
        path.resolve(__dirname, '../../tsconfig.json'),
        path.resolve(__dirname, '../../tsconfig.base.json')
      ]
    }),
    vue(),
    federation({
      name: 'shell',
      remotes: Object.fromEntries(
        REMOTE_REGISTRY.map((remote) => [
          remote.importKey,
          {
            type: 'module',
            name: remote.federationName,
            entry: getRemoteEntryUrl(remote.id)
          }
        ])
      ),
      shared: {
        vue: { singleton: true },
        pinia: { singleton: true },
        'vue-router': { singleton: true }
      }
    }),

    // ✅ Mock API as Vite/Connect middleware (no Express)
    {
      name: 'mock-api',
      configureServer(server) {
        const { middleware } = createMockApi();
        server.middlewares.use(middleware);
      }
    }
  ],

  cacheDir: resolve(__dirname, '../../node_modules/.vite/shell'),

  resolve: {
    alias: getSharedAliases(__dirname)
  },

  server: {
    host: 'csis.ir',
    port: 4990,
    strictPort: true,
    fs: {
      allow: [getWorkspaceRoot(__dirname)]
    },
    proxy: {
      '/remotes/app-one': {
        target: 'http://csis.ir:4991',
        changeOrigin: true,
        ws: true
      },
      '/remotes/app-two': {
        target: 'http://csis.ir:4992',
        changeOrigin: true,
        ws: true
      },
      '/remotes/insurance': {
        target: 'http://csis.ir:4993',
        changeOrigin: true,
        ws: true
      },
      '/remotes/admission': {
        target: 'http://csis.ir:4994',
        changeOrigin: true,
        ws: true
      },
      '/remotes/ops': {
        target: 'http://csis.ir:4995',
        changeOrigin: true,
        ws: true
      }
    }
  },

  build: {
    target: 'chrome89',
    outDir: path.resolve(__dirname, '../../dist/apps/shell'),
    emptyOutDir: true
  },

  preview: {
    host: 'csis.ir',
    port: 4990,
    strictPort: true
  }
});
