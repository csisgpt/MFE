import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const port = Number.parseInt(process.env.PORT || '4990', 10);
const distDir = path.resolve(__dirname, '../../../dist/apps/shell');
const indexFile = path.join(distDir, 'index.html');

app.use(express.json());

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

const getRole = (req) => (typeof req.headers['x-user-role'] === 'string' ? req.headers['x-user-role'] : '');

const requireAuth = (req, res) => {
  if (!req.headers.authorization) {
    res.status(401).json({ message: 'Missing token' });
    return false;
  }
  return true;
};

const requireAdmin = (req, res) => {
  const role = getRole(req);
  if (role !== 'admin' && role !== 'ops' && role !== 'reviewer') {
    res.status(403).json({ message: 'Admin role required' });
    return false;
  }
  return true;
};

app.get('/api/mock/orders', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(orders);
});

app.get('/api/mock/orders/:id', (req, res) => {
  if (!requireAuth(req, res)) return;
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(order);
});

app.post('/api/mock/orders/:id/approve', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json({ ok: true });
});

app.get('/api/mock/users', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(users);
});

app.post('/api/mock/reports', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json({ ok: true });
});

app.get('/api/mock/insurance/requests', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(insuranceRequests);
});

app.post('/api/mock/insurance/requests', (req, res) => {
  if (!requireAuth(req, res)) return;
  const payload = req.body ?? {};
  const created = {
    id: `ir-${(insuranceRequestId += 1)}`,
    employeeName: payload.employeeName ?? 'Employee',
    type: payload.type ?? 'New Policy',
    amount: payload.amount ?? 500,
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  insuranceRequests.unshift(created);
  res.json(created);
});

app.get('/api/mock/insurance/requests/:id', (req, res) => {
  if (!requireAuth(req, res)) return;
  const request = insuranceRequests.find((item) => item.id === req.params.id);
  if (!request) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(request);
});

app.put('/api/mock/insurance/requests/:id', (req, res) => {
  if (!requireAuth(req, res)) return;
  const index = insuranceRequests.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  insuranceRequests[index] = { ...insuranceRequests[index], ...(req.body ?? {}) };
  res.json(insuranceRequests[index]);
});

app.post('/api/mock/insurance/admin/requests/:id/approve', (req, res) => {
  if (!requireAuth(req, res) || !requireAdmin(req, res)) return;
  const request = insuranceRequests.find((item) => item.id === req.params.id);
  if (!request) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  request.status = 'approved';
  res.json(request);
});

app.post('/api/mock/insurance/admin/requests/:id/reject', (req, res) => {
  if (!requireAuth(req, res) || !requireAdmin(req, res)) return;
  const request = insuranceRequests.find((item) => item.id === req.params.id);
  if (!request) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  request.status = 'rejected';
  res.json(request);
});

app.get('/api/mock/insurance/claims', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(claims);
});

app.post('/api/mock/insurance/claims', (req, res) => {
  if (!requireAuth(req, res)) return;
  const payload = req.body ?? {};
  const created = {
    id: `cl-${(claimId += 1)}`,
    policyId: payload.policyId ?? 'p-1',
    claimant: payload.claimant ?? 'Employee',
    amount: payload.amount ?? 200,
    status: 'open',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  claims.unshift(created);
  res.json(created);
});

app.get('/api/mock/insurance/policies', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(policies);
});

app.post('/api/mock/insurance/policies', (req, res) => {
  if (!requireAuth(req, res)) return;
  const payload = req.body ?? {};
  const created = {
    id: `p-${(policyId += 1)}`,
    holder: payload.holder ?? 'Employee',
    plan: payload.plan ?? 'Standard',
    status: payload.status ?? 'active',
    renewalDate: payload.renewalDate ?? '2025-06-01'
  };
  policies.unshift(created);
  res.json(created);
});

app.put('/api/mock/insurance/policies', (req, res) => {
  if (!requireAuth(req, res)) return;
  const payload = req.body ?? {};
  const id = payload.id;
  const index = policies.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  policies[index] = { ...policies[index], ...payload };
  res.json(policies[index]);
});

app.get('/api/mock/admission/applications', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(admissionApplications);
});

app.post('/api/mock/admission/applications', (req, res) => {
  if (!requireAuth(req, res)) return;
  const payload = req.body ?? {};
  const created = {
    id: `ad-${(admissionId += 1)}`,
    applicantName: payload.applicantName ?? 'Applicant',
    program: payload.program ?? 'Business',
    status: 'new',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  admissionApplications.unshift(created);
  res.json(created);
});

app.get('/api/mock/admission/applications/:id', (req, res) => {
  if (!requireAuth(req, res)) return;
  const record = admissionApplications.find((item) => item.id === req.params.id);
  if (!record) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(record);
});

app.put('/api/mock/admission/applications/:id/review', (req, res) => {
  if (!requireAuth(req, res)) return;
  const index = admissionApplications.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  admissionApplications[index] = {
    ...admissionApplications[index],
    status: 'in_review',
    score: req.body?.score,
    decisionReason: req.body?.notes
  };
  res.json(admissionApplications[index]);
});

app.post('/api/mock/admission/applications/:id/decision', (req, res) => {
  if (!requireAuth(req, res) || !requireAdmin(req, res)) return;
  const index = admissionApplications.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  admissionApplications[index] = {
    ...admissionApplications[index],
    status: req.body?.decision === 'accept' ? 'accepted' : 'rejected',
    decisionReason: req.body?.reason
  };
  res.json(admissionApplications[index]);
});

app.get('/api/mock/admission/config', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(admissionConfig);
});

app.put('/api/mock/admission/config', (req, res) => {
  if (!requireAuth(req, res)) return;
  admissionConfig.workflow = req.body?.workflow ?? admissionConfig.workflow;
  admissionConfig.reviewers = req.body?.reviewers ?? admissionConfig.reviewers;
  res.json({ ok: true });
});

app.get('/api/mock/ops/kpis', (req, res) => {
  if (!requireAuth(req, res)) return;
  const pendingInsurance = insuranceRequests.filter((item) => item.status === 'pending').length;
  const approvedInsurance = insuranceRequests.filter((item) => item.status === 'approved').length;
  const acceptedAdmissions = admissionApplications.filter((item) => item.status === 'accepted').length;
  const rejectedAdmissions = admissionApplications.filter((item) => item.status === 'rejected').length;
  res.json([
    { label: 'Pending insurance', value: pendingInsurance },
    { label: 'Approved insurance', value: approvedInsurance },
    { label: 'Accepted admissions', value: acceptedAdmissions },
    { label: 'Rejected admissions', value: rejectedAdmissions }
  ]);
});

app.get('/api/mock/ops/alerts', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(opsAlerts);
});

app.post('/api/mock/ops/alerts/:id/ack', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json({ ok: true });
});

app.get('/api/mock/ops/reports', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(opsReports);
});

app.post('/api/mock/ops/reports', (req, res) => {
  if (!requireAuth(req, res)) return;
  const payload = req.body ?? {};
  const created = {
    id: `op-r${(reportId += 1)}`,
    title: payload.title ?? 'New report',
    status: 'draft',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  opsReports.unshift(created);
  res.json(created);
});

app.get('/api/mock/ops/analytics', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json(opsAnalytics);
});

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
