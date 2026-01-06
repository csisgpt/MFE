import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// tools/vite -> workspace root
const workspaceRoot = path.resolve(here, '../..');

const r = (p) => path.resolve(workspaceRoot, p);

export function getSharedAliases() {
  return [
    // ✅ exact-only (no prefix matching issues)
    { find: /^@shared\/config$/, replacement: r('libs/shared/config/src/index.ts') },
    { find: /^@shared\/auth$/, replacement: r('libs/shared/auth/src/index.ts') },
    { find: /^@shared\/store$/, replacement: r('libs/shared/store/src/index.ts') },
    { find: /^@shared\/api-client$/, replacement: r('libs/shared/api-client/src/index.ts') },
    { find: /^@shared\/permissions$/, replacement: r('libs/shared/permissions/src/index.ts') },

    { find: /^@shared\/ui\/styles$/, replacement: r('libs/shared/ui/src/styles.ts') },
    { find: /^@shared\/ui$/, replacement: r('libs/shared/ui/src/index.ts') },

    { find: /^@shared\/styles$/, replacement: r('libs/shared/styles/src/index.ts') },

    // ✅ subpath patterns
    { find: /^@shared\/styles\/(.*)$/, replacement: r('libs/shared/styles/src/$1') },
    { find: /^@shared\/assets\/(.*)$/, replacement: r('libs/shared/assets/src/$1') }
  ];
}
