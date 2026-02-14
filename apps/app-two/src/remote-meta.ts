import type { RemoteMeta } from '@shared/contracts';

export const remoteMeta: RemoteMeta = {
  name: 'app-two',
  version: __APP_VERSION__,
  buildTime: __BUILD_TIME__,
  requiredHostApi: '^1.0.0'
};
