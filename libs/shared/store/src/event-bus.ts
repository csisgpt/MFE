import mitt from 'mitt';

export type ToastPayload = {
  type: 'success' | 'error' | 'info';
  message: string;
};

export type NavigatePayload = {
  path: string;
};

export type Events = {
  AUTH_LOGOUT: undefined;
  THEME_CHANGED: { mode: 'light' | 'dark' };
  TOAST: ToastPayload;
  NAVIGATE: NavigatePayload;
};

export const eventBus = mitt<Events>();
