import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import { getRemoteEntryUrl } from '../../libs/shared/config/src/remotes';
import { createMockApi } from './tools/mock-api.mjs';
import { getSharedAliases, getWorkspaceRoot } from '../../tools/vite/shared-aliases';

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
      remotes: {
        appOne: `appOne@${getRemoteEntryUrl('appOne')}`,
        appTwo: `appTwo@${getRemoteEntryUrl('appTwo')}`,
        insurance: `insurance@${getRemoteEntryUrl('insurance')}`,
        admission: `admission@${getRemoteEntryUrl('admission')}`,
        ops: `ops@${getRemoteEntryUrl('ops')}`
      },
      shared: {
        vue: { singleton: true },
        pinia: { singleton: true },
        'vue-router': { singleton: true }
      }
    }),
    {
      name: 'mock-api',
      configureServer(server) {
        const { router } = createMockApi();
        server.middlewares.use(router);
      }
    }
  ],
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
