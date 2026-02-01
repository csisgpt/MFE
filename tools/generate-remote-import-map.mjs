import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const registryPath = path.join(workspaceRoot, 'libs/shared/config/src/registry.json');
const outputPath = path.join(
  workspaceRoot,
  'apps/shell/src/utils/remote-import-map.generated.ts'
);

const registryRaw = await readFile(registryPath, 'utf8');
const registry = JSON.parse(registryRaw);

const header = `// این فایل به صورت خودکار تولید می‌شود. برای به‌روزرسانی pnpm gen:remotes را اجرا کنید.\n`;
const lines = [header];
lines.push("import type { RemoteKey } from '../stores/remote-status.store';");
lines.push('');
lines.push('export const remoteMountLoaders: Record<RemoteKey, () => Promise<unknown>> = {');
for (const remote of registry) {
  lines.push(`  ${remote.id}: () => import('${remote.mountExport}'),`);
}
lines.push('};');
lines.push('');
lines.push('export const remoteMetaLoaders: Record<RemoteKey, () => Promise<unknown>> = {');
for (const remote of registry) {
  lines.push(`  ${remote.id}: () => import('${remote.metaExport}'),`);
}
lines.push('};');
lines.push('');

await writeFile(outputPath, lines.join('\n'), 'utf8');
console.log(`Generated ${path.relative(workspaceRoot, outputPath)}`);
