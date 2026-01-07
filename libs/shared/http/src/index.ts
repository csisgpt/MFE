import { getConfig } from '@shared/config';
import { eventBus, useHostAuthStore } from '@shared/store';
import { createLogger, createRequestId } from '@shared/observability';

export type HttpError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

type RequestOptions = RequestInit & { timeoutMs?: number };

type RequestInterceptor = (options: RequestOptions) => RequestOptions | Promise<RequestOptions>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

type HttpClientOptions = {
  baseUrl?: string;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
};

const logger = createLogger('http-client');

export function normalizeHttpError(status: number, message: string, details?: unknown): HttpError {
  const normalizedMessage =
    message ||
    (status === 0
      ? 'ارتباط با سرور برقرار نشد'
      : status === 401
        ? 'دسترسی شما منقضی شده است'
        : status === 403
          ? 'دسترسی غیرمجاز'
          : status === 404
            ? 'اطلاعات درخواستی یافت نشد'
            : status >= 500
              ? 'خطای داخلی سرور'
              : 'خطای غیرمنتظره');

  return {
    status,
    code: status === 0 ? 'NETWORK_ERROR' : `HTTP_${status}`,
    message: normalizedMessage,
    details
  };
}

export function createHttpClient(options: HttpClientOptions = {}) {
  const requestInterceptors = options.requestInterceptors ?? [];
  const responseInterceptors = options.responseInterceptors ?? [];

  async function request<T>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
    const config = getConfig();
    const authStore = useHostAuthStore();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestOptions.timeoutMs ?? 8000);
    const requestId = createRequestId();
    const startedAt = Date.now();

    try {
      let optionsWithHeaders: RequestOptions = {
        ...requestOptions,
        headers: {
          'Content-Type': 'application/json',
          ...(requestOptions.headers || {}),
          'x-request-id': requestId,
          'x-user-role': authStore.user?.role ?? '',
          Authorization: authStore.token ? `Bearer ${authStore.token}` : ''
        },
        signal: controller.signal
      };

      for (const interceptor of requestInterceptors) {
        optionsWithHeaders = await interceptor(optionsWithHeaders);
      }

      const response = await fetch(`${options.baseUrl ?? config.apiBaseUrl}${path}`, optionsWithHeaders);

      let interceptedResponse = response;
      for (const interceptor of responseInterceptors) {
        interceptedResponse = await interceptor(interceptedResponse);
      }

      if (!interceptedResponse.ok) {
        const message = await interceptedResponse.text();
        logger.warn(`درخواست ناموفق بود: ${path}`, {
          status: interceptedResponse.status,
          requestId
        });
        eventBus.emit('AUDIT_LOG', {
          id: requestId,
          level: 'error',
          message: 'درخواست رابط برنامه‌نویسی ناموفق بود',
          source: 'http-client',
          timestamp: new Date().toISOString(),
          context: { status: interceptedResponse.status }
        });
        throw normalizeHttpError(interceptedResponse.status, message);
      }

      if (interceptedResponse.status === 204) {
        logger.info(`درخواست ${path} انجام شد`, {
          requestId,
          durationMs: Date.now() - startedAt
        });
        return {} as T;
      }

      const data = (await interceptedResponse.json()) as T;
      logger.info(`درخواست ${path} انجام شد`, {
        requestId,
        durationMs: Date.now() - startedAt
      });
      eventBus.emit('AUDIT_LOG', {
        id: requestId,
        level: 'info',
      message: 'درخواست رابط برنامه‌نویسی انجام شد',
        source: 'http-client',
        timestamp: new Date().toISOString(),
        context: { durationMs: Date.now() - startedAt }
      });
      return data;
    } catch (error) {
      if ((error as HttpError).status) {
        throw error;
      }

      logger.error(`خطا در درخواست ${path}`, { error });
      eventBus.emit('AUDIT_LOG', {
        id: requestId,
        level: 'error',
        message: 'خطا در درخواست رابط برنامه‌نویسی',
        source: 'http-client',
        timestamp: new Date().toISOString(),
        context: { error: (error as Error).message }
      });
      throw normalizeHttpError(0, (error as Error).message, error);
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    request,
    get<T>(path: string, options?: RequestOptions) {
      return request<T>(path, { ...options, method: 'GET' });
    },
    post<T>(path: string, body?: unknown, options?: RequestOptions) {
      return request<T>(path, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined
      });
    },
    put<T>(path: string, body?: unknown, options?: RequestOptions) {
      return request<T>(path, {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined
      });
    },
    delete<T>(path: string, options?: RequestOptions) {
      return request<T>(path, { ...options, method: 'DELETE' });
    }
  };
}

export const httpClient = createHttpClient();
