import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { createRequire } from 'module';

const isStandalone = process.env.VITE_STANDALONE === 'true';
const base = isStandalone ? '/' : '/remotes/admission/';
const require = createRequire(import.meta.url);
const appVersion = require('../../package.json').version;
const buildTime = new Date().toISOString();

export default defineConfig({
  base,
  plugins: [
    tsconfigPaths(),
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
  server: {
    host: 'csis.ir',
    port: 4994,
    strictPort: true,
    origin: isStandalone ? 'http://csis.ir:4994' : 'http://csis.ir:4990'
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../libs/shared')
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
