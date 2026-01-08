// apps/shell/tools/mock-api.ts
import type { Connect } from 'vite';
import { createMockDb, paginate } from '@shared/mocks';

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

function toPersianDigits(value: number) {
  const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return value.toString().replace(/\d/g, (digit) => map[Number(digit)] ?? digit);
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
    requests: any[];
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
    { id: '1001', status: 'در انتظار', total: 240 },
    { id: '1002', status: 'تایید شده', total: 120 },
    { id: '1003', status: 'در انتظار', total: 560 }
  ];

  const mockDb = createMockDb();
  const users = mockDb.users;
  const requests = mockDb.requests;

  let userId = 1005;
  let requestId = 2004;
  let insuranceRequestId = 3;
  let claimId = 2;
  let policyId = 3;
  let admissionId = 3;
  let reportId = 2;

  const insuranceRequests = [
    {
      id: 'درخواست-۱',
      employeeName: 'آوا سنگی',
      type: 'بیمه جدید',
      amount: 1200,
      status: 'در انتظار',
      createdAt: '۱۴۰۲/۱۱/۲۱'
    },
    {
      id: 'درخواست-۲',
      employeeName: 'میلاد رای',
      type: 'به‌روزرسانی پوشش',
      amount: 900,
      status: 'تایید شده',
      createdAt: '۱۴۰۲/۱۱/۲۵'
    }
  ];

  const claims = [
    {
      id: 'خسارت-۱',
      policyId: 'بیمه-۱',
      claimant: 'آوا سنگی',
      amount: 400,
      status: 'باز',
      createdAt: '۱۴۰۲/۱۱/۱۲'
    }
  ];

  const policies = [
    { id: 'بیمه-۱', holder: 'آوا سنگی', plan: 'طلایی', status: 'فعال', renewalDate: '۱۴۰۴/۱۰/۱۱' },
    { id: 'بیمه-۲', holder: 'میلاد رای', plan: 'نقره‌ای', status: 'فعال', renewalDate: '۱۴۰۴/۱۲/۲۰' }
  ];

  const admissionApplications = [
    {
      id: 'پذیرش-۱',
      applicantName: 'جردن لی',
      program: 'مدیریت',
      status: 'جدید',
      createdAt: '۱۴۰۲/۱۲/۱۰'
    },
    {
      id: 'پذیرش-۲',
      applicantName: 'سام پاتل',
      program: 'مهندسی',
      status: 'در بررسی',
      score: 85,
      createdAt: '۱۴۰۲/۱۲/۱۱'
    }
  ];

  const admissionConfig = {
    workflow: 'بازبینی استاندارد',
    reviewers: ['رئیس دانشکده', 'ثبت‌نام']
  };

  const opsAlerts = [
    { id: 'هشدار-۱', message: 'عقب‌افتادگی خسارت‌ها از آستانه گذشت', severity: 'بالا' },
    { id: 'هشدار-۲', message: 'هشدار سطح خدمت تصمیم‌گیری پذیرش', severity: 'متوسط' }
  ];

  const opsReports = [
    { id: 'گزارش-۱', title: 'خلاصه هفتگی عملیات', status: 'منتشرشده', createdAt: '۱۴۰۲/۱۲/۱۲' }
  ];

  const opsAnalytics = [
    { id: 'تحلیل-۱', segment: 'منطقه شرق', value: 72 },
    { id: 'تحلیل-۲', segment: 'منطقه غرب', value: 61 }
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
      sendJson(res, 401, { message: 'توکن موجود نیست' });
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
      sendJson(res, 403, { message: 'دسترسی غیرمجاز' });
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
    const { pathname, searchParams } = parseUrl(req);
    const method = (req.method || 'GET').toUpperCase();

    // Only handle /api/mock/*
    if (!pathname.startsWith('/api/mock/')) return next();

    let body: any;
    try {
      body = await readJsonBody(req);
    } catch {
      return sendJson(res, 400, { message: 'بدنه جی‌سون نامعتبر است' });
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
        if (!order) return sendJson(res, 404, { message: 'یافت نشد' });
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
      if (searchParams.get('error') === 'true' || req.headers['x-mock-error'] === 'true') {
        return sendJson(res, 500, { message: 'خطای شبیه‌سازی شده در دریافت کاربران' });
      }
      const delay = Number(searchParams.get('delay') ?? 350);
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      if (searchParams.get('mode') === 'list') {
        return sendJson(
          res,
          200,
          users.map((user) => ({ id: user.id, name: user.fullName, role: user.role }))
        );
      }
      const q = (searchParams.get('q') ?? '').trim();
      const status = searchParams.get('status') ?? '';
      const role = searchParams.get('role') ?? '';
      const page = Number(searchParams.get('page') ?? 1);
      const pageSize = Number(searchParams.get('pageSize') ?? 10);
      const filtered = users.filter((user) => {
        const matchesQuery =
          !q ||
          user.fullName.includes(q) ||
          user.username.includes(q) ||
          user.department.includes(q);
        const matchesStatus = !status || user.status === status;
        const matchesRole = !role || user.role === role;
        return matchesQuery && matchesStatus && matchesRole;
      });
      return sendJson(res, 200, paginate(filtered, page, pageSize));
    }

    if (method === 'POST' && pathname === '/api/mock/users') {
      if (!requireAuth(req, res)) return;
      const payload = body ?? {};
      const created = {
        id: `کاربر-${toPersianDigits((userId += 1))}`,
        username: payload.username ?? `کاربر-${toPersianDigits(userId)}`,
        fullName: payload.fullName ?? 'کارمند جدید',
        department: payload.department ?? 'منابع انسانی',
        role: payload.role ?? 'کارشناس',
        status: payload.status ?? 'فعال',
        phone: payload.phone ?? '۰۹۱۲۰۰۰۰۰۰۰',
        createdAt: new Date().toISOString()
      };
      users.unshift(created);
      return sendJson(res, 200, created);
    }

    {
      const m = match(pathname, /^\/api\/mock\/users\/([^/]+)$/);
      if (method === 'GET' && m) {
        if (!requireAuth(req, res)) return;
        const record = users.find((item) => item.id === m[1]);
        if (!record) return sendJson(res, 404, { message: 'یافت نشد' });
        return sendJson(res, 200, record);
      }
      if (method === 'PUT' && m) {
        if (!requireAuth(req, res)) return;
        const index = users.findIndex((item) => item.id === m[1]);
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });
        users[index] = { ...users[index], ...(body ?? {}) };
        return sendJson(res, 200, users[index]);
      }
      if (method === 'DELETE' && m) {
        if (!requireAuth(req, res)) return;
        const index = users.findIndex((item) => item.id === m[1]);
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });
        users.splice(index, 1);
        return sendJson(res, 200, { ok: true });
      }
    }

    // ---- Requests
    if (method === 'GET' && pathname === '/api/mock/requests') {
      if (!requireAuth(req, res)) return;
      if (searchParams.get('error') === 'true' || req.headers['x-mock-error'] === 'true') {
        return sendJson(res, 500, { message: 'خطای شبیه‌سازی شده در دریافت درخواست‌ها' });
      }
      const delay = Number(searchParams.get('delay') ?? 400);
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      const q = (searchParams.get('q') ?? '').trim();
      const status = searchParams.get('status') ?? '';
      const page = Number(searchParams.get('page') ?? 1);
      const pageSize = Number(searchParams.get('pageSize') ?? 10);
      const filtered = requests.filter((item) => {
        const matchesQuery =
          !q || item.title.includes(q) || item.requester.includes(q) || item.assignee.includes(q);
        const matchesStatus = !status || item.status === status;
        return matchesQuery && matchesStatus;
      });
      return sendJson(res, 200, paginate(filtered, page, pageSize));
    }

    if (method === 'POST' && pathname === '/api/mock/requests') {
      if (!requireAuth(req, res)) return;
      const payload = body ?? {};
      const created = {
        id: `درخواست-${toPersianDigits((requestId += 1))}`,
        title: payload.title ?? 'درخواست جدید',
        requester: payload.requester ?? 'ثبت‌کننده ناشناس',
        assignee: payload.assignee ?? 'بدون مسئول',
        status: payload.status ?? 'جدید',
        priority: payload.priority ?? 'متوسط',
        createdAt: new Date().toISOString()
      };
      requests.unshift(created);
      return sendJson(res, 200, created);
    }

    if (method === 'PATCH' && match(pathname, /^\/api\/mock\/requests\/([^/]+)\/status$/)) {
      if (!requireAuth(req, res)) return;
      const m = match(pathname, /^\/api\/mock\/requests\/([^/]+)\/status$/);
      const id = m?.[1];
      const index = requests.findIndex((item) => item.id === id);
      if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });
      requests[index] = { ...requests[index], status: body?.status ?? requests[index].status };
      return sendJson(res, 200, requests[index]);
    }

    {
      const m = match(pathname, /^\/api\/mock\/requests\/([^/]+)$/);
      if (method === 'GET' && m) {
        if (!requireAuth(req, res)) return;
        const record = requests.find((item) => item.id === m[1]);
        if (!record) return sendJson(res, 404, { message: 'یافت نشد' });
        return sendJson(res, 200, record);
      }
      if (method === 'PUT' && m) {
        if (!requireAuth(req, res)) return;
        const index = requests.findIndex((item) => item.id === m[1]);
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });
        requests[index] = { ...requests[index], ...(body ?? {}) };
        return sendJson(res, 200, requests[index]);
      }
      if (method === 'DELETE' && m) {
        if (!requireAuth(req, res)) return;
        const index = requests.findIndex((item) => item.id === m[1]);
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });
        requests.splice(index, 1);
        return sendJson(res, 200, { ok: true });
      }
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
        id: `درخواست-${(insuranceRequestId += 1)}`,
        employeeName: payload.employeeName ?? 'کارمند نمونه',
        type: payload.type ?? 'بیمه جدید',
        amount: payload.amount ?? 500,
        status: 'در انتظار',
        createdAt: '۱۴۰۲/۱۲/۲۰'
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
        if (!request) return sendJson(res, 404, { message: 'یافت نشد' });
        return sendJson(res, 200, request);
      }

      if (method === 'PUT' && m) {
        if (!requireAuth(req, res)) return;
        const id = m[1];
        const index = insuranceRequests.findIndex((x) => x.id === id);
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });
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
        if (!request) return sendJson(res, 404, { message: 'یافت نشد' });
        request.status = 'تایید شده';
        return sendJson(res, 200, request);
      }

      const mReject = match(pathname, /^\/api\/mock\/insurance\/admin\/requests\/([^/]+)\/reject$/);
      if (method === 'POST' && mReject) {
        if (!requireAuth(req, res) || !requireRole(req, res, ['admin'])) return;
        const id = mReject[1];
        const request = insuranceRequests.find((x) => x.id === id);
        if (!request) return sendJson(res, 404, { message: 'یافت نشد' });
        request.status = 'رد شده';
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
        id: `خسارت-${(claimId += 1)}`,
        policyId: payload.policyId ?? 'بیمه-۱',
        claimant: payload.claimant ?? 'کارمند نمونه',
        amount: payload.amount ?? 200,
        status: 'باز',
        createdAt: '۱۴۰۲/۱۲/۲۰'
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
        id: `بیمه-${(policyId += 1)}`,
        holder: payload.holder ?? 'کارمند نمونه',
        plan: payload.plan ?? 'استاندارد',
        status: payload.status ?? 'فعال',
        renewalDate: payload.renewalDate ?? '۱۴۰۳/۰۳/۱۱'
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
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });
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
        id: `پذیرش-${(admissionId += 1)}`,
        applicantName: payload.applicantName ?? 'متقاضی نمونه',
        program: payload.program ?? 'مدیریت',
        status: 'جدید',
        createdAt: '۱۴۰۲/۱۲/۲۰'
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
        if (!record) return sendJson(res, 404, { message: 'یافت نشد' });
        return sendJson(res, 200, record);
      }
    }

    {
      const m = match(pathname, /^\/api\/mock\/admission\/applications\/([^/]+)\/review$/);
      if (method === 'PUT' && m) {
        if (!requireAuth(req, res)) return;
        const id = m[1];
        const index = admissionApplications.findIndex((x) => x.id === id);
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });

        admissionApplications[index] = {
          ...admissionApplications[index],
          status: 'در بررسی',
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
        if (index === -1) return sendJson(res, 404, { message: 'یافت نشد' });

        admissionApplications[index] = {
          ...admissionApplications[index],
          status: body?.decision === 'پذیرش' ? 'پذیرفته‌شده' : 'رد شده',
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

      const pendingInsurance = insuranceRequests.filter((x) => x.status === 'در انتظار').length;
      const approvedInsurance = insuranceRequests.filter((x) => x.status === 'تایید شده').length;
      const acceptedAdmissions = admissionApplications.filter((x) => x.status === 'پذیرفته‌شده').length;
      const rejectedAdmissions = admissionApplications.filter((x) => x.status === 'رد شده').length;

      return sendJson(res, 200, [
        { label: 'بیمه‌های در انتظار', value: pendingInsurance },
        { label: 'بیمه‌های تایید شده', value: approvedInsurance },
        { label: 'پذیرش‌های تایید شده', value: acceptedAdmissions },
        { label: 'پذیرش‌های رد شده', value: rejectedAdmissions }
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
        id: `گزارش-${(reportId += 1)}`,
        title: payload.title ?? 'گزارش جدید',
        status: 'پیش‌نویس',
        createdAt: '۱۴۰۲/۱۲/۲۰'
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
    return sendJson(res, 404, { message: 'یافت نشد' });
  };

  return {
    middleware,
    db: {
      orders,
      users,
      requests,
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
