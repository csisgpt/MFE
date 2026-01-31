import type { RuntimeConfig } from './index';
import { getRemoteEntryUrl } from './remotes';
import registryData from './registry.json';

export type RemoteId =
  | 'appOne'
  | 'appTwo'
  | 'insurance'
  | 'admission'
  | 'ops';

export type RemoteRegistryEntry = {
  id: RemoteId;
  importKey: string;
  federationName: string;
  basePath: string;
  mountExport: string;
  metaExport: string;
  titleFa: string;
  enabledByDefault: boolean;
  projectName: string;
  disabledFlag?: keyof RuntimeConfig['featureFlags'];
  icon?: string;
};

export const REMOTE_REGISTRY = registryData as RemoteRegistryEntry[];

export const REMOTE_REGISTRY_BY_ID = new Map(
  REMOTE_REGISTRY.map((remote) => [remote.id, remote])
);

export function getEnabledRemotes(config: RuntimeConfig): RemoteRegistryEntry[] {
  return REMOTE_REGISTRY.filter((remote) => {
    if (!remote.enabledByDefault) return false;
    if (!remote.disabledFlag) return true;
    return !config.featureFlags[remote.disabledFlag];
  });
}

export type ShellRemoteRoute = {
  path: string;
  name: string;
  remoteId: RemoteId;
  titleFa: string;
};

export function buildShellRoutes(
  registry: RemoteRegistryEntry[] = REMOTE_REGISTRY
): ShellRemoteRoute[] {
  return registry.map((remote) => ({
    path: `${remote.basePath}/:catchAll(.*)*`,
    name: remote.importKey,
    remoteId: remote.id,
    titleFa: remote.titleFa
  }));
}

export function buildRemoteEntryMap() {
  return Object.fromEntries(
    REMOTE_REGISTRY.map((remote) => [remote.id, getRemoteEntryUrl(remote.id)])
  );
}

export { getRemoteEntryUrl };



// {
//     "id": "appTwo",
//     "importKey": "app-two",
//     "federationName": "appTwo",
//     "basePath": "/app-two",
//     "mountExport": "appTwo/AppTwoMount",
//     "metaExport": "appTwo/meta",
//     "titleFa": "اپلیکیشن دو",
//     "enabledByDefault": true,
//     "projectName": "app-two"
//   },
//   {
//     "id": "insurance",
//     "importKey": "insurance",
//     "federationName": "insurance",
//     "basePath": "/insurance",
//     "mountExport": "insurance/InsuranceMount",
//     "metaExport": "insurance/meta",
//     "titleFa": "بیمه",
//     "enabledByDefault": true,
//     "projectName": "insurance",
//     "disabledFlag": "disableInsurance"
//   },
//   {
//     "id": "admission",
//     "importKey": "admission",
//     "federationName": "admission",
//     "basePath": "/admission",
//     "mountExport": "admission/AdmissionMount",
//     "metaExport": "admission/meta",
//     "titleFa": "پذیرش",
//     "enabledByDefault": true,
//     "projectName": "admission",
//     "disabledFlag": "disableAdmission"
//   },
//   {
//     "id": "ops",
//     "importKey": "ops",
//     "federationName": "ops",
//     "basePath": "/ops",
//     "mountExport": "ops/OpsMount",
//     "metaExport": "ops/meta",
//     "titleFa": "عملیات",
//     "enabledByDefault": true,
//     "projectName": "ops",
//     "disabledFlag": "disableOps"
//   }