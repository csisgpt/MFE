import { useHostAuthStore } from '@shared/store';
import type { PermissionKey } from '@shared/contracts';

const rolePermissions: Record<string, PermissionKey[] | ['*']> = {
  admin: ['*'],
  employee: ['insurance:request:create', 'insurance:claim:create'],
  user: ['insurance:request:create', 'insurance:claim:create'],
  reviewer: ['admission:decision'],
  ops: ['ops:admin']
};

export function can(permission: PermissionKey): boolean {
  const authStore = useHostAuthStore();
  const role = authStore.user?.role ?? 'user';
  const permissions = rolePermissions[role] ?? [];
  if (permissions.includes('*' as PermissionKey)) {
    return true;
  }
  return permissions.includes(permission);
}

export function requirePermission(permission: PermissionKey): void {
  if (!can(permission)) {
    throw new Error(`مجوز لازم موجود نیست: ${permission}`);
  }
}
