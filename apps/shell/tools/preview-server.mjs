import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createMockApi } from './mock-api.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const port = Number.parseInt(process.env.PORT || '4990', 10);
const distDir = path.resolve(__dirname, '../../../dist/apps/shell');
const indexFile = path.join(distDir, 'index.html');

const { router } = createMockApi();
app.use(router);

app.use(
  '/remotes/app-one',
  createProxyMiddleware({ target: 'http://csis.ir:4991', changeOrigin: true, pathRewrite: { '^/remotes/app-one': '' } })
);
app.use(
  '/remotes/app-two',
  createProxyMiddleware({ target: 'http://csis.ir:4992', changeOrigin: true, pathRewrite: { '^/remotes/app-two': '' } })
);
app.use(
  '/remotes/insurance',
  createProxyMiddleware({ target: 'http://csis.ir:4993', changeOrigin: true, pathRewrite: { '^/remotes/insurance': '' } })
);
app.use(
  '/remotes/admission',
  createProxyMiddleware({ target: 'http://csis.ir:4994', changeOrigin: true, pathRewrite: { '^/remotes/admission': '' } })
);
app.use(
  '/remotes/ops',
  createProxyMiddleware({ target: 'http://csis.ir:4995', changeOrigin: true, pathRewrite: { '^/remotes/ops': '' } })
);

app.use(express.static(distDir));

app.get('*', (req, res) => {
  res.sendFile(indexFile);
});

app.listen(port, 'csis.ir', () => {
  console.log(`Shell preview server running at http://csis.ir:${port}`);
});
