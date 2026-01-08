declare module 'appOne/*';
declare module 'appTwo/*';
declare module 'insurance/*';
declare module 'admission/*';
declare module 'ops/*';

declare module 'appOne/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}
declare module 'appTwo/meta' {
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
