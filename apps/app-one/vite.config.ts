import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { createRequire } from 'module';

const isStandalone = process.env.VITE_STANDALONE === 'true';
const base = isStandalone ? '/' : '/remotes/app-one/';
const require = createRequire(import.meta.url);
const appVersion = require('../../package.json').version;
const buildTime = new Date().toISOString();

export default defineConfig({
  base,
  plugins: [
    tsconfigPaths(),
    vue(),
    federation({
      name: 'appOne',
      filename: 'remoteEntry.js',
      exposes: {
        './AppOneMount': './src/AppOneMount.vue',
        './meta': './src/remote-meta.ts'
      },
      shared: {
        vue: { singleton: true },
        pinia: { singleton: true },
        'vue-router': { singleton: true }
      }
    })
  ],
  server: {
    host: 'csis.ir',
    port: 4991,
    strictPort: true,
    origin: isStandalone ? 'http://csis.ir:4991' : 'http://csis.ir:4990'
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../libs/shared')
    }
  },
  build: {
    target: 'chrome89',
    outDir: path.resolve(__dirname, '../../dist/apps/app-one'),
    emptyOutDir: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_TIME__: JSON.stringify(buildTime)
  },
  preview: {
    host: 'csis.ir',
    port: 4991,
    strictPort: true
  }
});
