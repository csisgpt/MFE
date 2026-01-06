import { getConfig } from '@shared/config';
import { eventBus, useHostAuthStore } from '@shared/store';
import { createLogger, createRequestId } from '@shared/observability';
import type {
  AdmissionApplication,
  Claim,
  InsuranceRequest,
  Policy,
  Report,
  User
} from '@shared/contracts';

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

type RequestOptions = RequestInit & { timeoutMs?: number };

const logger = createLogger('api-client');

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const config = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  const authStore = useHostAuthStore();
  const requestId = createRequestId();
  const startedAt = Date.now();

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        'x-request-id': requestId,
        'x-user-role': authStore.user?.role ?? '',
        Authorization: authStore.token ? `Bearer ${authStore.token}` : ''
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const message = await response.text();
      logger.warn(`Request failed: ${path}`, { status: response.status, requestId });
      eventBus.emit('AUDIT_LOG', {
        id: requestId,
        level: 'error',
        message: `API ${path} failed`,
        source: 'api-client',
        timestamp: new Date().toISOString(),
        context: { status: response.status }
      });
      throw normalizeError(response.status, message);
    }

    if (response.status === 204) {
      logger.info(`Request ${path} completed`, { requestId, durationMs: Date.now() - startedAt });
      return {} as T;
    }

    const data = (await response.json()) as T;
    logger.info(`Request ${path} completed`, { requestId, durationMs: Date.now() - startedAt });
    eventBus.emit('AUDIT_LOG', {
      id: requestId,
      level: 'info',
      message: `API ${path} completed`,
      source: 'api-client',
      timestamp: new Date().toISOString(),
      context: { durationMs: Date.now() - startedAt }
    });
    return data;
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }

    logger.error(`Request ${path} error`, { requestId, error });
    eventBus.emit('AUDIT_LOG', {
      id: requestId,
      level: 'error',
      message: `API ${path} error`,
      source: 'api-client',
      timestamp: new Date().toISOString(),
      context: { error: (error as Error).message }
    });
    throw normalizeError(0, (error as Error).message, error);
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeError(status: number, message: string, details?: unknown): ApiError {
  return {
    status,
    code: status === 0 ? 'NETWORK_ERROR' : `HTTP_${status}`,
    message: message || 'Unexpected error',
    details
  };
}

export const getOrders = () => request<{ id: string; status: string; total: number }[]>('/mock/orders');
export const getOrder = (id: string) =>
  request<{ id: string; status: string; total: number }>(`/mock/orders/${id}`);
export const approveOrder = (id: string) =>
  request<{ ok: boolean }>(`/mock/orders/${id}/approve`, { method: 'POST' });
export const getUsers = () => request<User[]>('/mock/users');
export const createReport = (payload: { title: string; dateRange: string; notes: string }) =>
  request<{ ok: boolean }>(`/mock/reports`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getInsuranceRequests = () => request<InsuranceRequest[]>('/mock/insurance/requests');
export const createInsuranceRequest = (payload: Partial<InsuranceRequest>) =>
  request<InsuranceRequest>('/mock/insurance/requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const getInsuranceRequest = (id: string) =>
  request<InsuranceRequest>(`/mock/insurance/requests/${id}`);
export const updateInsuranceRequest = (id: string, payload: Partial<InsuranceRequest>) =>
  request<InsuranceRequest>(`/mock/insurance/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const approveInsuranceRequest = (id: string) =>
  request<InsuranceRequest>(`/mock/insurance/admin/requests/${id}/approve`, { method: 'POST' });
export const rejectInsuranceRequest = (id: string) =>
  request<InsuranceRequest>(`/mock/insurance/admin/requests/${id}/reject`, { method: 'POST' });
export const getClaims = () => request<Claim[]>('/mock/insurance/claims');
export const createClaim = (payload: Partial<Claim>) =>
  request<Claim>('/mock/insurance/claims', { method: 'POST', body: JSON.stringify(payload) });
export const getPolicies = () => request<Policy[]>('/mock/insurance/policies');
export const createPolicy = (payload: Partial<Policy>) =>
  request<Policy>('/mock/insurance/policies', { method: 'POST', body: JSON.stringify(payload) });
export const updatePolicy = (id: string, payload: Partial<Policy>) =>
  request<Policy>(`/mock/insurance/policies/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const getAdmissionApplications = () =>
  request<AdmissionApplication[]>('/mock/admission/applications');
export const getAdmissionApplication = (id: string) =>
  request<AdmissionApplication>(`/mock/admission/applications/${id}`);
export const reviewAdmissionApplication = (id: string, payload: { score: number; notes: string }) =>
  request<AdmissionApplication>(`/mock/admission/applications/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const decideAdmissionApplication = (id: string, payload: { decision: string; reason: string }) =>
  request<AdmissionApplication>(`/mock/admission/applications/${id}/decision`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const getAdmissionConfig = () =>
  request<{ workflow: string; reviewers: string[] }>('/mock/admission/config');
export const updateAdmissionConfig = (payload: { workflow: string; reviewers: string[] }) =>
  request<{ ok: boolean }>('/mock/admission/config', { method: 'PUT', body: JSON.stringify(payload) });

export const getOpsKpis = () => request<{ label: string; value: number }[]>('/mock/ops/kpis');
export const getOpsAlerts = () => request<{ id: string; message: string; severity: string }[]>(
  '/mock/ops/alerts'
);
export const ackOpsAlert = (id: string) =>
  request<{ ok: boolean }>(`/mock/ops/alerts/${id}/ack`, { method: 'POST' });
export const getOpsReports = () => request<Report[]>('/mock/ops/reports');
export const createOpsReport = (payload: Partial<Report>) =>
  request<Report>('/mock/ops/reports', { method: 'POST', body: JSON.stringify(payload) });
export const getOpsAnalytics = () => request<{ id: string; segment: string; value: number }[]>(
  '/mock/ops/analytics'
);
