import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import { createRequire } from 'module';
import { getSharedAliases, getWorkspaceRoot } from '../../tools/vite/shared-aliases';
import { resolve } from 'node:path'
const isStandalone = process.env.VITE_STANDALONE === 'true';
const base = isStandalone ? '/' : '/remotes/admission/';
const require = createRequire(import.meta.url);
const appVersion = require('../../package.json').version;
const buildTime = new Date().toISOString();

export default defineConfig({
  base,
  plugins: [
    tsconfigPaths({
      projects: [
        path.resolve(__dirname, '../../tsconfig.json'),
        path.resolve(__dirname, '../../tsconfig.base.json')
      ]
    }),
    vue(),
    federation({
      name: 'admission',
      filename: 'remoteEntry.js',
      exposes: {
        './AdmissionMount': './src/AdmissionMount.vue',
        './meta': './src/remote-meta.ts'
      },
      shared: {
        vue: { singleton: true },
        pinia: { singleton: true },
        'vue-router': { singleton: true }
      }
    })
  ],
    cacheDir: resolve(__dirname, '../../node_modules/.vite/admission'),

  resolve: {
    alias: getSharedAliases(__dirname)
  },
  server: {
    host: 'csis.ir',
    port: 4994,
    strictPort: true,
    origin: isStandalone ? 'http://csis.ir:4994' : 'http://csis.ir:4990',
    fs: {
      allow: [getWorkspaceRoot(__dirname)]
    }
  },
  build: {
    target: 'chrome89',
    outDir: path.resolve(__dirname, '../../dist/apps/admission'),
    emptyOutDir: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_TIME__: JSON.stringify(buildTime)
  },
  preview: {
    host: 'csis.ir',
    port: 4994,
    strictPort: true
  }
});
