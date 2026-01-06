export type LogLevel = 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  source: string;
  context?: Record<string, unknown>;
};

export function createRequestId(): string {
  return `req_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export function createLogger(source: string) {
  return {
    info(message: string, context?: Record<string, unknown>) {
      log('info', message, source, context);
    },
    warn(message: string, context?: Record<string, unknown>) {
      log('warn', message, source, context);
    },
    error(message: string, context?: Record<string, unknown>) {
      log('error', message, source, context);
    }
  };
}

export function log(level: LogLevel, message: string, source: string, context?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    source,
    timestamp: new Date().toISOString(),
    context
  };
  if (import.meta.env.DEV) {
    const payload = { ...entry };
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`[${source}] ${message}`, payload.context ?? '');
  }
  return entry;
}
