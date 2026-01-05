import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const isStandalone = process.env.VITE_STANDALONE === 'true';
const base = isStandalone ? '/' : '/remotes/app-one/';

export default defineConfig({
  base,
  plugins: [
    tsconfigPaths(),
    vue(),
    federation({
      name: 'appOne',
      filename: 'remoteEntry.js',
      exposes: {
        './AppOneMount': './src/AppOneMount.vue'
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
  preview: {
    host: 'csis.ir',
    port: 4991,
    strictPort: true
  }
});
