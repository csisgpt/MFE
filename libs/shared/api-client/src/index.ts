import { getConfig } from '@shared/config';
import { useHostAuthStore } from '@shared/store';

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

type RequestOptions = RequestInit & { timeoutMs?: number };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const config = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  const authStore = useHostAuthStore();

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: authStore.token ? `Bearer ${authStore.token}` : ''
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const message = await response.text();
      throw normalizeError(response.status, message);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }

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
export const getOrder = (id: string) => request<{ id: string; status: string; total: number }>(`/mock/orders/${id}`);
export const approveOrder = (id: string) =>
  request<{ ok: boolean }>(`/mock/orders/${id}/approve`, { method: 'POST' });
export const getUsers = () => request<{ id: string; name: string; role: string }[]>('/mock/users');
export const createReport = (payload: { title: string; dateRange: string; notes: string }) =>
  request<{ ok: boolean }>(`/mock/reports`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
