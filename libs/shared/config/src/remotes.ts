import { getConfig } from './index';
import type { RemoteId } from './registry';

export function getRemotePrefix(name: RemoteId): string {
  const { remotePrefixes } = getConfig();
  return remotePrefixes[name] ?? `/remotes/${name}`;
}

export function getRemoteEntryUrl(name: RemoteId): string {
  return `${getRemotePrefix(name)}/remoteEntry.js`;
}
