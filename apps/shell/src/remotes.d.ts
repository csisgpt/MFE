declare module 'app-one/*';
declare module 'app-two/*';
declare module 'insurance/*';
declare module 'admission/*';
declare module 'ops/*';

declare module 'app-one/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}
declare module 'app-two/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}
declare module 'insurance/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}
declare module 'admission/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}
declare module 'ops/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}
