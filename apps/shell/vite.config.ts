import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { getRemoteEntryUrl } from '../../libs/shared/config/src/remotes';
import { createMockApi } from './tools/mock-api.mjs';
import { getSharedAliases } from '../../tools/vite/shared-aliases.mjs';

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
    alias: getSharedAliases()
  },
  server: {
    host: 'csis.ir',
    port: 4990,
    strictPort: true,
    proxy: {
      '/remotes/app-one': {
        target: 'http://csis.ir:4991',
        changeOrigin: true,
        rewrite: (path) => path.replace('/remotes/app-one', '')
      },
      '/remotes/app-two': {
        target: 'http://csis.ir:4992',
        changeOrigin: true,
        rewrite: (path) => path.replace('/remotes/app-two', '')
      },
      '/remotes/insurance': {
        target: 'http://csis.ir:4993',
        changeOrigin: true,
        rewrite: (path) => path.replace('/remotes/insurance', '')
      },
      '/remotes/admission': {
        target: 'http://csis.ir:4994',
        changeOrigin: true,
        rewrite: (path) => path.replace('/remotes/admission', '')
      },
      '/remotes/ops': {
        target: 'http://csis.ir:4995',
        changeOrigin: true,
        rewrite: (path) => path.replace('/remotes/ops', '')
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
