// این فایل به صورت خودکار تولید می‌شود. برای به‌روزرسانی pnpm gen:remotes را اجرا کنید.

import type { RemoteKey } from '../stores/remote-status.store';

export const remoteMountLoaders: Record<RemoteKey, () => Promise<unknown>> = {
  appOne: () => import('appOne/AppOneMount'),
  appTwo: () => import('appTwo/AppTwoMount'),
  insurance: () => import('insurance/InsuranceMount'),
  admission: () => import('admission/AdmissionMount'),
  ops: () => import('ops/OpsMount'),
};

export const remoteMetaLoaders: Record<RemoteKey, () => Promise<unknown>> = {
  appOne: () => import('appOne/meta'),
  appTwo: () => import('appTwo/meta'),
  insurance: () => import('insurance/meta'),
  admission: () => import('admission/meta'),
  ops: () => import('ops/meta'),
};
