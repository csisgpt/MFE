// apps/shell/tools/mock-api.ts
import type { Connect } from 'vite';

type Role = 'admin' | 'user' | 'employee' | 'reviewer' | 'ops';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function parseUrl(req: Connect.IncomingMessage) {
  // req.url can be relative; add a dummy origin for URL parsing
  const url = new URL(req.url || '/', 'http://localhost');
  return {
    pathname: url.pathname,
    searchParams: url.searchParams
  };
}

function sendJson(res: Connect.ServerResponse, status: number, data: Json) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function readJsonBody(req: Connect.IncomingMessage): Promise<any> {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') return undefined;

  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.includes('application/json')) return undefined;

  return await new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function createMockApi(): {
  middleware: Connect.NextHandleFunction;
  db: {
    orders: any[];
    users: any[];
    insuranceRequests: any[];
    claims: any[];
    policies: any[];
    admissionApplications: any[];
    admissionConfig: any;
    opsAlerts: any[];
    opsReports: any[];
    opsAnalytics: any[];
  };
} {
  // -----------------------------
  // In-memory DB (same as before)
  // -----------------------------
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
    {
      id: 'cl-1',
      policyId: 'p-1',
      claimant: 'Ava Stone',
      amount: 400,
      status: 'open',
      createdAt: '2024-02-01'
    }
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

  const opsReports = [{ id: 'op-r1', title: 'Weekly Ops Summary', status: 'published', createdAt: '2024-03-03' }];

  const opsAnalytics = [
    { id: 'an-1', segment: 'Region East', value: 72 },
    { id: 'an-2', segment: 'Region West', value: 61 }
  ];

  // -----------------------------
  // Auth helpers (same behavior)
  // -----------------------------
  const roleFromToken = (token: string): Role | '' => {
    const normalized = token.replace('Bearer ', '');
    const map: Record<string, Role> = {
      'mock-admin': 'admin',
      'mock-employee': 'employee',
      'mock-reviewer': 'reviewer',
      'mock-ops': 'ops'
    };
    return map[normalized] || '';
  };

  const getRole = (req: Connect.IncomingMessage): Role | '' => {
    const headerRole = req.headers['x-user-role'];
    if (typeof headerRole === 'string' && headerRole) return headerRole as Role;

    const auth = req.headers.authorization;
    if (typeof auth === 'string') return roleFromToken(auth);

    return '';
  };

  const requireAuth = (req: Connect.IncomingMessage, res: Connect.ServerResponse): boolean => {
    if (!req.headers.authorization) {
      sendJson(res, 401, { message: 'Missing token' });
      return false;
    }
    return true;
  };

  const requireRole = (
    req: Connect.IncomingMessage,
    res: Connect.ServerResponse,
    roles: Role[]
  ): boolean => {
    const role = getRole(req);
    if (!role || !roles.includes(role)) {
      sendJson(res, 403, { message: 'Forbidden' });
      return false;
    }
    return true;
  };

  // -----------------------------
  // Route matching helpers
  // -----------------------------
  const match = (pathname: string, pattern: RegExp): RegExpExecArray | null => pattern.exec(pathname);

  // -----------------------------
  // Connect middleware
  // -----------------------------
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const { pathname } = parseUrl(req);
    const method = (req.method || 'GET').toUpperCase();

    // Only handle /api/mock/*
    if (!pathname.startsWith('/api/mock/')) return next();

    let body: any;
    try {
      body = await readJsonBody(req);
    } catch {
      return sendJson(res, 400, { message: 'Invalid JSON body' });
    }

    // ---- Orders
    if (method === 'GET' && pathname === '/api/mock/orders') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, orders);
    }

    {
      const m = match(pathname, /^\/api\/mock\/orders\/([^/]+)$/);
      if (method === 'GET' && m) {
        if (!requireAuth(req, res)) return;
        const id = m[1];
        const order = orders.find((x) => x.id === id);
        if (!order) return sendJson(res, 404, { message: 'Not found' });
        return sendJson(res, 200, order);
      }
      if (method === 'POST' && match(pathname, /^\/api\/mock\/orders\/([^/]+)\/approve$/)) {
        if (!requireAuth(req, res)) return;
        return sendJson(res, 200, { ok: true });
      }
    }

    // ---- Users
    if (method === 'GET' && pathname === '/api/mock/users') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, users);
    }

    // ---- Reports
    if (method === 'POST' && pathname === '/api/mock/reports') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, { ok: true });
    }

    // ---- Insurance: requests
    if (method === 'GET' && pathname === '/api/mock/insurance/requests') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, insuranceRequests);
    }

    if (method === 'POST' && pathname === '/api/mock/insurance/requests') {
      if (!requireAuth(req, res)) return;
      const payload = body ?? {};
      const created = {
        id: `ir-${(insuranceRequestId += 1)}`,
        employeeName: payload.employeeName ?? 'Employee',
        type: payload.type ?? 'New Policy',
        amount: payload.amount ?? 500,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      insuranceRequests.unshift(created);
      return sendJson(res, 200, created);
    }

    {
      const m = match(pathname, /^\/api\/mock\/insurance\/requests\/([^/]+)$/);
      if (method === 'GET' && m) {
        if (!requireAuth(req, res)) return;
        const id = m[1];
        const request = insuranceRequests.find((x) => x.id === id);
        if (!request) return sendJson(res, 404, { message: 'Not found' });
        return sendJson(res, 200, request);
      }

      if (method === 'PUT' && m) {
        if (!requireAuth(req, res)) return;
        const id = m[1];
        const index = insuranceRequests.findIndex((x) => x.id === id);
        if (index === -1) return sendJson(res, 404, { message: 'Not found' });
        insuranceRequests[index] = { ...insuranceRequests[index], ...(body ?? {}) };
        return sendJson(res, 200, insuranceRequests[index]);
      }
    }

    {
      const mApprove = match(pathname, /^\/api\/mock\/insurance\/admin\/requests\/([^/]+)\/approve$/);
      if (method === 'POST' && mApprove) {
        if (!requireAuth(req, res) || !requireRole(req, res, ['admin'])) return;
        const id = mApprove[1];
        const request = insuranceRequests.find((x) => x.id === id);
        if (!request) return sendJson(res, 404, { message: 'Not found' });
        request.status = 'approved';
        return sendJson(res, 200, request);
      }

      const mReject = match(pathname, /^\/api\/mock\/insurance\/admin\/requests\/([^/]+)\/reject$/);
      if (method === 'POST' && mReject) {
        if (!requireAuth(req, res) || !requireRole(req, res, ['admin'])) return;
        const id = mReject[1];
        const request = insuranceRequests.find((x) => x.id === id);
        if (!request) return sendJson(res, 404, { message: 'Not found' });
        request.status = 'rejected';
        return sendJson(res, 200, request);
      }
    }

    // ---- Insurance: claims
    if (method === 'GET' && pathname === '/api/mock/insurance/claims') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, claims);
    }

    if (method === 'POST' && pathname === '/api/mock/insurance/claims') {
      if (!requireAuth(req, res)) return;
      const payload = body ?? {};
      const created = {
        id: `cl-${(claimId += 1)}`,
        policyId: payload.policyId ?? 'p-1',
        claimant: payload.claimant ?? 'Employee',
        amount: payload.amount ?? 200,
        status: 'open',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      claims.unshift(created);
      return sendJson(res, 200, created);
    }

    // ---- Insurance: policies
    if (method === 'GET' && pathname === '/api/mock/insurance/policies') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, policies);
    }

    if (method === 'POST' && pathname === '/api/mock/insurance/policies') {
      if (!requireAuth(req, res) || !requireRole(req, res, ['admin'])) return;
      const payload = body ?? {};
      const created = {
        id: `p-${(policyId += 1)}`,
        holder: payload.holder ?? 'Employee',
        plan: payload.plan ?? 'Standard',
        status: payload.status ?? 'active',
        renewalDate: payload.renewalDate ?? '2025-06-01'
      };
      policies.unshift(created);
      return sendJson(res, 200, created);
    }

    {
      const m = match(pathname, /^\/api\/mock\/insurance\/policies\/([^/]+)$/);
      if (method === 'PUT' && m) {
        if (!requireAuth(req, res) || !requireRole(req, res, ['admin'])) return;
        const id = m[1];
        const index = policies.findIndex((x) => x.id === id);
        if (index === -1) return sendJson(res, 404, { message: 'Not found' });
        policies[index] = { ...policies[index], ...(body ?? {}) };
        return sendJson(res, 200, policies[index]);
      }
    }

    // ---- Admission: applications
    if (method === 'GET' && pathname === '/api/mock/admission/applications') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, admissionApplications);
    }

    if (method === 'POST' && pathname === '/api/mock/admission/applications') {
      if (!requireAuth(req, res)) return;
      const payload = body ?? {};
      const created = {
        id: `ad-${(admissionId += 1)}`,
        applicantName: payload.applicantName ?? 'Applicant',
        program: payload.program ?? 'Business',
        status: 'new',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      admissionApplications.unshift(created);
      return sendJson(res, 200, created);
    }

    {
      const m = match(pathname, /^\/api\/mock\/admission\/applications\/([^/]+)$/);
      if (method === 'GET' && m) {
        if (!requireAuth(req, res)) return;
        const id = m[1];
        const record = admissionApplications.find((x) => x.id === id);
        if (!record) return sendJson(res, 404, { message: 'Not found' });
        return sendJson(res, 200, record);
      }
    }

    {
      const m = match(pathname, /^\/api\/mock\/admission\/applications\/([^/]+)\/review$/);
      if (method === 'PUT' && m) {
        if (!requireAuth(req, res)) return;
        const id = m[1];
        const index = admissionApplications.findIndex((x) => x.id === id);
        if (index === -1) return sendJson(res, 404, { message: 'Not found' });

        admissionApplications[index] = {
          ...admissionApplications[index],
          status: 'in_review',
          score: body?.score,
          decisionReason: body?.notes
        };
        return sendJson(res, 200, admissionApplications[index]);
      }
    }

    {
      const m = match(pathname, /^\/api\/mock\/admission\/applications\/([^/]+)\/decision$/);
      if (method === 'POST' && m) {
        if (!requireAuth(req, res) || !requireRole(req, res, ['admin', 'reviewer'])) return;
        const id = m[1];
        const index = admissionApplications.findIndex((x) => x.id === id);
        if (index === -1) return sendJson(res, 404, { message: 'Not found' });

        admissionApplications[index] = {
          ...admissionApplications[index],
          status: body?.decision === 'accept' ? 'accepted' : 'rejected',
          decisionReason: body?.reason
        };
        return sendJson(res, 200, admissionApplications[index]);
      }
    }

    // ---- Admission: config
    if (method === 'GET' && pathname === '/api/mock/admission/config') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, admissionConfig);
    }

    if (method === 'PUT' && pathname === '/api/mock/admission/config') {
      if (!requireAuth(req, res) || !requireRole(req, res, ['admin'])) return;
      admissionConfig.workflow = body?.workflow ?? admissionConfig.workflow;
      admissionConfig.reviewers = body?.reviewers ?? admissionConfig.reviewers;
      return sendJson(res, 200, { ok: true });
    }

    // ---- Ops: kpis
    if (method === 'GET' && pathname === '/api/mock/ops/kpis') {
      if (!requireAuth(req, res)) return;

      const pendingInsurance = insuranceRequests.filter((x) => x.status === 'pending').length;
      const approvedInsurance = insuranceRequests.filter((x) => x.status === 'approved').length;
      const acceptedAdmissions = admissionApplications.filter((x) => x.status === 'accepted').length;
      const rejectedAdmissions = admissionApplications.filter((x) => x.status === 'rejected').length;

      return sendJson(res, 200, [
        { label: 'Pending insurance', value: pendingInsurance },
        { label: 'Approved insurance', value: approvedInsurance },
        { label: 'Accepted admissions', value: acceptedAdmissions },
        { label: 'Rejected admissions', value: rejectedAdmissions }
      ]);
    }

    // ---- Ops: alerts
    if (method === 'GET' && pathname === '/api/mock/ops/alerts') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, opsAlerts);
    }

    {
      const m = match(pathname, /^\/api\/mock\/ops\/alerts\/([^/]+)\/ack$/);
      if (method === 'POST' && m) {
        if (!requireAuth(req, res) || !requireRole(req, res, ['admin', 'ops'])) return;
        return sendJson(res, 200, { ok: true });
      }
    }

    // ---- Ops: reports
    if (method === 'GET' && pathname === '/api/mock/ops/reports') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, opsReports);
    }

    if (method === 'POST' && pathname === '/api/mock/ops/reports') {
      if (!requireAuth(req, res)) return;
      const payload = body ?? {};
      const created = {
        id: `op-r${(reportId += 1)}`,
        title: payload.title ?? 'New report',
        status: 'draft',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      opsReports.unshift(created);
      return sendJson(res, 200, created);
    }

    // ---- Ops: analytics
    if (method === 'GET' && pathname === '/api/mock/ops/analytics') {
      if (!requireAuth(req, res)) return;
      return sendJson(res, 200, opsAnalytics);
    }

    // fallback
    return sendJson(res, 404, { message: 'Not found' });
  };

  return {
    middleware,
    db: {
      orders,
      users,
      insuranceRequests,
      claims,
      policies,
      admissionApplications,
      admissionConfig,
      opsAlerts,
      opsReports,
      opsAnalytics
    }
  };
}
