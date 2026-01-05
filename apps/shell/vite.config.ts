import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@module-federation/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { getRemoteEntryUrl } from '../../libs/shared/config/src/remotes';

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

let insuranceRequestId = 3;
let claimId = 2;
let policyId = 3;
let admissionId = 3;
let reportId = 2;

const insuranceRequests = [
  {
    id: 'ir-1',
    employeeName: 'Ava Stone',
    type: 'New Policy',
    amount: 1200,
    status: 'pending',
    createdAt: '2024-02-10'
  },
  {
    id: 'ir-2',
    employeeName: 'Miles Ray',
    type: 'Coverage Update',
    amount: 900,
    status: 'approved',
    createdAt: '2024-02-14'
  }
];

const claims = [
  { id: 'cl-1', policyId: 'p-1', claimant: 'Ava Stone', amount: 400, status: 'open', createdAt: '2024-02-01' }
];

const policies = [
  { id: 'p-1', holder: 'Ava Stone', plan: 'Gold', status: 'active', renewalDate: '2025-01-01' },
  { id: 'p-2', holder: 'Miles Ray', plan: 'Silver', status: 'active', renewalDate: '2025-03-10' }
];

const admissionApplications = [
  {
    id: 'ad-1',
    applicantName: 'Jordan Lee',
    program: 'Business',
    status: 'new',
    createdAt: '2024-03-01'
  },
  {
    id: 'ad-2',
    applicantName: 'Sam Patel',
    program: 'Engineering',
    status: 'in_review',
    score: 85,
    createdAt: '2024-03-02'
  }
];

const admissionConfig = {
  workflow: 'Standard Review',
  reviewers: ['Dean', 'Registrar']
};

const opsAlerts = [
  { id: 'op-1', message: 'Claims backlog above threshold', severity: 'high' },
  { id: 'op-2', message: 'Admissions decision SLA warning', severity: 'medium' }
];

const opsReports = [
  { id: 'op-r1', title: 'Weekly Ops Summary', status: 'published', createdAt: '2024-03-03' }
];

const opsAnalytics = [
  { id: 'an-1', segment: 'Region East', value: 72 },
  { id: 'an-2', segment: 'Region West', value: 61 }
];

const getRole = (req: { headers: Record<string, string | string[] | undefined> }) =>
  typeof req.headers['x-user-role'] === 'string' ? req.headers['x-user-role'] : '';

const sendJson = (res: { statusCode: number; setHeader: (key: string, value: string) => void; end: (body?: string) => void }, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const readBody = (req: { on: (event: string, cb: (chunk: Buffer) => void) => void }) =>
  new Promise<string>((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    req.on('end', () => resolve(data));
  });

const requireAuth = (req: { headers: Record<string, string | string[] | undefined> }, res: { statusCode: number; end: (body?: string) => void }) => {
  if (!req.headers.authorization) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: 'Missing token' }));
    return false;
  }
  return true;
};

const requireAdmin = (
  req: { headers: Record<string, string | string[] | undefined> },
  res: { statusCode: number; end: (body?: string) => void }
) => {
  const role = getRole(req);
  if (role !== 'admin' && role !== 'ops' && role !== 'reviewer') {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: 'Admin role required' }));
    return false;
  }
  return true;
};

export default defineConfig({
  plugins: [
    tsconfigPaths(),
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
        server.middlewares.use('/api/mock/orders', (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, orders);
            return;
          }
          res.statusCode = 405;
          res.end();
        });
        server.middlewares.use('/api/mock/orders/', (req, res) => {
          if (!requireAuth(req, res)) return;
          const id = req.url?.split('/')[1]?.split('?')[0] ?? '';
          if (req.method === 'GET') {
            const order = orders.find((item) => item.id === id);
            if (!order) {
              sendJson(res, 404, { message: 'Not found' });
              return;
            }
            sendJson(res, 200, order);
            return;
          }
          if (req.method === 'POST' && req.url?.includes('approve')) {
            sendJson(res, 200, { ok: true });
            return;
          }
          res.statusCode = 405;
          res.end();
        });
        server.middlewares.use('/api/mock/users', (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, users);
            return;
          }
          res.statusCode = 405;
          res.end();
        });
        server.middlewares.use('/api/mock/reports', (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'POST') {
            sendJson(res, 200, { ok: true });
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/insurance/requests', async (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, insuranceRequests);
            return;
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            const created = {
              id: `ir-${(insuranceRequestId += 1)}`,
              employeeName: payload.employeeName ?? 'Employee',
              type: payload.type ?? 'New Policy',
              amount: payload.amount ?? 500,
              status: 'pending',
              createdAt: new Date().toISOString().slice(0, 10)
            };
            insuranceRequests.unshift(created);
            sendJson(res, 200, created);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/insurance/requests/', async (req, res) => {
          if (!requireAuth(req, res)) return;
          const id = req.url?.split('/')[1]?.split('?')[0] ?? '';
          const requestIndex = insuranceRequests.findIndex((item) => item.id === id);
          if (req.method === 'GET') {
            const request = insuranceRequests.find((item) => item.id === id);
            if (!request) {
              sendJson(res, 404, { message: 'Not found' });
              return;
            }
            sendJson(res, 200, request);
            return;
          }
          if (req.method === 'PUT') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            if (requestIndex === -1) {
              sendJson(res, 404, { message: 'Not found' });
              return;
            }
            insuranceRequests[requestIndex] = { ...insuranceRequests[requestIndex], ...payload };
            sendJson(res, 200, insuranceRequests[requestIndex]);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/insurance/admin/requests/', async (req, res) => {
          if (!requireAuth(req, res)) return;
          if (!requireAdmin(req, res)) return;
          const parts = req.url?.split('/') ?? [];
          const id = parts[1] ?? '';
          const action = parts[2];
          const request = insuranceRequests.find((item) => item.id === id);
          if (!request) {
            sendJson(res, 404, { message: 'Not found' });
            return;
          }
          if (req.method === 'POST' && action === 'approve') {
            request.status = 'approved';
            sendJson(res, 200, request);
            return;
          }
          if (req.method === 'POST' && action === 'reject') {
            request.status = 'rejected';
            sendJson(res, 200, request);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/insurance/claims', async (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, claims);
            return;
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            const created = {
              id: `cl-${(claimId += 1)}`,
              policyId: payload.policyId ?? 'p-1',
              claimant: payload.claimant ?? 'Employee',
              amount: payload.amount ?? 200,
              status: 'open',
              createdAt: new Date().toISOString().slice(0, 10)
            };
            claims.unshift(created);
            sendJson(res, 200, created);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/insurance/policies', async (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, policies);
            return;
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            const created = {
              id: `p-${(policyId += 1)}`,
              holder: payload.holder ?? 'Employee',
              plan: payload.plan ?? 'Standard',
              status: payload.status ?? 'active',
              renewalDate: payload.renewalDate ?? '2025-06-01'
            };
            policies.unshift(created);
            sendJson(res, 200, created);
            return;
          }
          if (req.method === 'PUT') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            const id = payload.id ?? req.url?.split('/')[1];
            const index = policies.findIndex((item) => item.id === id);
            if (index === -1) {
              sendJson(res, 404, { message: 'Not found' });
              return;
            }
            policies[index] = { ...policies[index], ...payload };
            sendJson(res, 200, policies[index]);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/admission/applications', async (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, admissionApplications);
            return;
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            const created = {
              id: `ad-${(admissionId += 1)}`,
              applicantName: payload.applicantName ?? 'Applicant',
              program: payload.program ?? 'Business',
              status: 'new',
              createdAt: new Date().toISOString().slice(0, 10)
            };
            admissionApplications.unshift(created);
            sendJson(res, 200, created);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/admission/applications/', async (req, res) => {
          if (!requireAuth(req, res)) return;
          const id = req.url?.split('/')[1]?.split('?')[0] ?? '';
          const index = admissionApplications.findIndex((item) => item.id === id);
          if (req.method === 'GET') {
            const record = admissionApplications.find((item) => item.id === id);
            if (!record) {
              sendJson(res, 404, { message: 'Not found' });
              return;
            }
            sendJson(res, 200, record);
            return;
          }
          if (req.method === 'PUT' && req.url?.includes('review')) {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            if (index === -1) {
              sendJson(res, 404, { message: 'Not found' });
              return;
            }
            admissionApplications[index] = {
              ...admissionApplications[index],
              status: 'in_review',
              score: payload.score,
              decisionReason: payload.notes
            };
            sendJson(res, 200, admissionApplications[index]);
            return;
          }
          if (req.method === 'POST' && req.url?.includes('decision')) {
            if (!requireAdmin(req, res)) return;
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            if (index === -1) {
              sendJson(res, 404, { message: 'Not found' });
              return;
            }
            admissionApplications[index] = {
              ...admissionApplications[index],
              status: payload.decision === 'accept' ? 'accepted' : 'rejected',
              decisionReason: payload.reason
            };
            sendJson(res, 200, admissionApplications[index]);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/admission/config', async (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, admissionConfig);
            return;
          }
          if (req.method === 'PUT') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            admissionConfig.workflow = payload.workflow ?? admissionConfig.workflow;
            admissionConfig.reviewers = payload.reviewers ?? admissionConfig.reviewers;
            sendJson(res, 200, { ok: true });
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/ops/kpis', (req, res) => {
          if (!requireAuth(req, res)) return;
          const pendingInsurance = insuranceRequests.filter((item) => item.status === 'pending').length;
          const approvedInsurance = insuranceRequests.filter((item) => item.status === 'approved').length;
          const acceptedAdmissions = admissionApplications.filter((item) => item.status === 'accepted').length;
          const rejectedAdmissions = admissionApplications.filter((item) => item.status === 'rejected').length;
          sendJson(res, 200, [
            { label: 'Pending insurance', value: pendingInsurance },
            { label: 'Approved insurance', value: approvedInsurance },
            { label: 'Accepted admissions', value: acceptedAdmissions },
            { label: 'Rejected admissions', value: rejectedAdmissions }
          ]);
        });

        server.middlewares.use('/api/mock/ops/alerts', (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, opsAlerts);
            return;
          }
          if (req.method === 'POST' && req.url?.includes('ack')) {
            sendJson(res, 200, { ok: true });
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/ops/reports', async (req, res) => {
          if (!requireAuth(req, res)) return;
          if (req.method === 'GET') {
            sendJson(res, 200, opsReports);
            return;
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}');
            const created = {
              id: `op-r${(reportId += 1)}`,
              title: payload.title ?? 'New report',
              status: 'draft',
              createdAt: new Date().toISOString().slice(0, 10)
            };
            opsReports.unshift(created);
            sendJson(res, 200, created);
            return;
          }
          res.statusCode = 405;
          res.end();
        });

        server.middlewares.use('/api/mock/ops/analytics', (req, res) => {
          if (!requireAuth(req, res)) return;
          sendJson(res, 200, opsAnalytics);
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
