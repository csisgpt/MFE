declare module 'appOne/AppOneMount' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'appTwo/AppTwoMount' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'appOne/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}

declare module 'appTwo/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}

declare module 'insurance/InsuranceMount' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'insurance/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}

declare module 'admission/AdmissionMount' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'admission/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}

declare module 'ops/OpsMount' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'ops/meta' {
  import type { RemoteMeta } from '@shared/contracts';
  export const remoteMeta: RemoteMeta;
}
