import { getConfig } from './index';

export type RemoteName = 'appOne' | 'appTwo' | 'insurance' | 'admission' | 'ops';

export function getRemotePrefix(name: RemoteName): string {
  const { remotePrefixes } = getConfig();
  return remotePrefixes[name] ?? `/remotes/${name}`;
}

export function getRemoteEntryUrl(name: RemoteName): string {
  return `${getRemotePrefix(name)}/remoteEntry.js`;
}
