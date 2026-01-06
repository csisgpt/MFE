import path from 'node:path';

export function getWorkspaceRoot(fromDir: string): string {
  return path.resolve(fromDir, '../..');
}

export function getSharedAliases(fromDir: string): { find: RegExp; replacement: string }[] {
  const workspaceRoot = getWorkspaceRoot(fromDir);
  const r = (p: string) => path.resolve(workspaceRoot, p);

  return [
    { find: /^@shared\/config$/, replacement: r('libs/shared/config/src/index.ts') },
    { find: /^@shared\/auth$/, replacement: r('libs/shared/auth/src/index.ts') },
    { find: /^@shared\/store$/, replacement: r('libs/shared/store/src/index.ts') },
    { find: /^@shared\/api-client$/, replacement: r('libs/shared/api-client/src/index.ts') },
    { find: /^@shared\/permissions$/, replacement: r('libs/shared/permissions/src/index.ts') },
    { find: /^@shared\/ui$/, replacement: r('libs/shared/ui/src/index.ts') },
    { find: /^@shared\/ui\/styles$/, replacement: r('libs/shared/ui/src/styles.ts') },
    { find: /^@shared\/styles$/, replacement: r('libs/shared/styles/src/index.ts') },
    { find: /^@shared\/styles\/(.*)$/, replacement: r('libs/shared/styles/src/$1') },
    { find: /^@shared\/assets\/(.*)$/, replacement: r('libs/shared/assets/src/$1') }
  ];
}
