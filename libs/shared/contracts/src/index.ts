export type RemoteMeta = {
  name: string;
  version: string;
  buildTime: string;
};

export type InsuranceRequestStatus = 'در انتظار' | 'تایید شده' | 'رد شده';
export type ClaimStatus = 'باز' | 'در حال بررسی' | 'بسته';
export type AdmissionStatus = 'جدید' | 'در بررسی' | 'پذیرفته‌شده' | 'رد شده';
export type ReportStatus = 'پیش‌نویس' | 'منتشرشده';

export interface InsuranceRequest {
  id: string;
  employeeName: string;
  type: string;
  amount: number;
  status: InsuranceRequestStatus;
  createdAt: string;
}

export interface Claim {
  id: string;
  policyId: string;
  claimant: string;
  amount: number;
  status: ClaimStatus;
  createdAt: string;
}

export interface Policy {
  id: string;
  holder: string;
  plan: string;
  status: 'فعال' | 'منقضی';
  renewalDate: string;
}

export interface AdmissionApplication {
  id: string;
  applicantName: string;
  program: string;
  status: AdmissionStatus;
  score?: number;
  decisionReason?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
}

export interface Report {
  id: string;
  title: string;
  status: ReportStatus;
  createdAt: string;
}

export type ToastPayload = {
  type: 'success' | 'error' | 'info';
  message: string;
};

export type NavigatePayload = {
  path: string;
};

export type AuditEvent = {
  id: string;
  level: 'info' | 'error';
  message: string;
  source: string;
  timestamp: string;
  context?: Record<string, unknown>;
};

export type AppEventMap = {
  AUTH_LOGOUT: undefined;
  THEME_CHANGED: { mode: 'light' | 'dark' };
  TOAST: ToastPayload;
  NAVIGATE: NavigatePayload;
  AUDIT_LOG: AuditEvent;
  REMOTE_STATUS: { name: string; status: 'loaded' | 'failed'; error?: string };
};

export type PermissionKey =
  | 'insurance:request:create'
  | 'insurance:request:approve'
  | 'insurance:request:reject'
  | 'insurance:claim:create'
  | 'admission:decision'
  | 'ops:admin'
  | 'reports:create';
