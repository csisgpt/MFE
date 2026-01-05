import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const orders = [
  { id: '1001', status: 'Pending', total: 240 },
  { id: '1002', status: 'Approved', total: 120 },
  { id: '1003', status: 'Pending', total: 560 }
];

const users = [
  { id: 'u1', name: 'Ava Stone', role: 'admin' },
  { id: 'u2', name: 'Miles Ray', role: 'user' },
  { id: 'u3', name: 'Priya Singh', role: 'user' }
];

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    vue(),
    federation({
      name: 'shell',
      remotes: {
        appOne: 'appOne@/remotes/app-one/remoteEntry.js',
        appTwo: 'appTwo@/remotes/app-two/remoteEntry.js'
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
        server.middlewares.use('/api/mock/orders', (req, res) => {
          if (!req.headers.authorization) {
            res.statusCode = 401;
            res.end(JSON.stringify({ message: 'Missing token' }));
            return;
          }
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(orders));
            return;
          }
          res.statusCode = 405;
          res.end();
        });
        server.middlewares.use('/api/mock/orders/', (req, res) => {
          if (!req.headers.authorization) {
            res.statusCode = 401;
            res.end(JSON.stringify({ message: 'Missing token' }));
            return;
          }
          const id = req.url?.split('/')[1]?.split('?')[0] ?? '';
          if (req.method === 'GET') {
            const order = orders.find((item) => item.id === id);
            if (!order) {
              res.statusCode = 404;
              res.end(JSON.stringify({ message: 'Not found' }));
              return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(order));
            return;
          }
          if (req.method === 'POST' && req.url?.includes('approve')) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
            return;
          }
          res.statusCode = 405;
          res.end();
        });
        server.middlewares.use('/api/mock/users', (req, res) => {
          if (!req.headers.authorization) {
            res.statusCode = 401;
            res.end(JSON.stringify({ message: 'Missing token' }));
            return;
          }
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(users));
            return;
          }
          res.statusCode = 405;
          res.end();
        });
        server.middlewares.use('/api/mock/reports', (req, res) => {
          if (!req.headers.authorization) {
            res.statusCode = 401;
            res.end(JSON.stringify({ message: 'Missing token' }));
            return;
          }
          if (req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
            return;
          }
          res.statusCode = 405;
          res.end();
        });
      }
    }
  ],
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
      }
    }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../libs/shared')
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
