import { httpClient, normalizeHttpError } from '@shared/http';
import type {
  AdmissionApplication,
  Claim,
  InsuranceRequest,
  PersonnelUser,
  Policy,
  Report,
  ServiceRequest,
  User
} from '@shared/contracts';

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function normalizeError(status: number, message: string, details?: unknown): ApiError {
  return normalizeHttpError(status, message, details);
}

export const getOrders = () => httpClient.request<{ id: string; status: string; total: number }[]>('/mock/orders');
export const getOrder = (id: string) =>
  httpClient.request<{ id: string; status: string; total: number }>(`/mock/orders/${id}`);
export const approveOrder = (id: string) =>
  httpClient.request<{ ok: boolean }>(`/mock/orders/${id}/approve`, { method: 'POST' });
export const getUsers = () => httpClient.request<User[]>('/mock/users');
export const createReport = (payload: { title: string; dateRange: string; notes: string }) =>
  httpClient.request<{ ok: boolean }>(`/mock/reports`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getPersonnelUsers = (page = 1, pageSize = 10, error = false) =>
  httpClient.request<PaginatedResponse<PersonnelUser>>(
    `/mock/personnel/users?page=${page}&pageSize=${pageSize}${error ? '&error=true' : ''}`
  );
export const getPersonnelUser = (id: string) =>
  httpClient.request<PersonnelUser>(`/mock/personnel/users/${id}`);
export const createPersonnelUser = (payload: Partial<PersonnelUser>) =>
  httpClient.request<PersonnelUser>(`/mock/personnel/users`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const updatePersonnelUser = (id: string, payload: Partial<PersonnelUser>) =>
  httpClient.request<PersonnelUser>(`/mock/personnel/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const deletePersonnelUser = (id: string) =>
  httpClient.request<{ ok: boolean }>(`/mock/personnel/users/${id}`, { method: 'DELETE' });

export const getServiceRequests = (page = 1, pageSize = 10, error = false) =>
  httpClient.request<PaginatedResponse<ServiceRequest>>(
    `/mock/requests?page=${page}&pageSize=${pageSize}${error ? '&error=true' : ''}`
  );
export const getServiceRequest = (id: string) =>
  httpClient.request<ServiceRequest>(`/mock/requests/${id}`);
export const createServiceRequest = (payload: Partial<ServiceRequest>) =>
  httpClient.request<ServiceRequest>(`/mock/requests`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const updateServiceRequest = (id: string, payload: Partial<ServiceRequest>) =>
  httpClient.request<ServiceRequest>(`/mock/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const deleteServiceRequest = (id: string) =>
  httpClient.request<{ ok: boolean }>(`/mock/requests/${id}`, { method: 'DELETE' });

export const getInsuranceRequests = () => httpClient.request<InsuranceRequest[]>('/mock/insurance/requests');
export const createInsuranceRequest = (payload: Partial<InsuranceRequest>) =>
  httpClient.request<InsuranceRequest>('/mock/insurance/requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const getInsuranceRequest = (id: string) =>
  httpClient.request<InsuranceRequest>(`/mock/insurance/requests/${id}`);
export const updateInsuranceRequest = (id: string, payload: Partial<InsuranceRequest>) =>
  httpClient.request<InsuranceRequest>(`/mock/insurance/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const approveInsuranceRequest = (id: string) =>
  httpClient.request<InsuranceRequest>(`/mock/insurance/admin/requests/${id}/approve`, { method: 'POST' });
export const rejectInsuranceRequest = (id: string) =>
  httpClient.request<InsuranceRequest>(`/mock/insurance/admin/requests/${id}/reject`, { method: 'POST' });
export const getClaims = () => httpClient.request<Claim[]>('/mock/insurance/claims');
export const createClaim = (payload: Partial<Claim>) =>
  httpClient.request<Claim>('/mock/insurance/claims', { method: 'POST', body: JSON.stringify(payload) });
export const getPolicies = () => httpClient.request<Policy[]>('/mock/insurance/policies');
export const createPolicy = (payload: Partial<Policy>) =>
  httpClient.request<Policy>('/mock/insurance/policies', { method: 'POST', body: JSON.stringify(payload) });
export const updatePolicy = (id: string, payload: Partial<Policy>) =>
  httpClient.request<Policy>(`/mock/insurance/policies/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const getAdmissionApplications = () =>
  httpClient.request<AdmissionApplication[]>('/mock/admission/applications');
export const getAdmissionApplication = (id: string) =>
  httpClient.request<AdmissionApplication>(`/mock/admission/applications/${id}`);
export const reviewAdmissionApplication = (id: string, payload: { score: number; notes: string }) =>
  httpClient.request<AdmissionApplication>(`/mock/admission/applications/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const decideAdmissionApplication = (id: string, payload: { decision: string; reason: string }) =>
  httpClient.request<AdmissionApplication>(`/mock/admission/applications/${id}/decision`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const getAdmissionConfig = () =>
  httpClient.request<{ workflow: string; reviewers: string[] }>('/mock/admission/config');
export const updateAdmissionConfig = (payload: { workflow: string; reviewers: string[] }) =>
  httpClient.request<{ ok: boolean }>('/mock/admission/config', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const getOpsKpis = () => httpClient.request<{ label: string; value: number }[]>('/mock/ops/kpis');
export const getOpsAlerts = () =>
  httpClient.request<{ id: string; message: string; severity: string }[]>(
    '/mock/ops/alerts'
  );
export const ackOpsAlert = (id: string) =>
  httpClient.request<{ ok: boolean }>(`/mock/ops/alerts/${id}/ack`, { method: 'POST' });
export const getOpsReports = () => httpClient.request<Report[]>('/mock/ops/reports');
export const createOpsReport = (payload: Partial<Report>) =>
  httpClient.request<Report>('/mock/ops/reports', { method: 'POST', body: JSON.stringify(payload) });
export const getOpsAnalytics = () =>
  httpClient.request<{ id: string; segment: string; value: number }[]>(
    '/mock/ops/analytics'
  );
