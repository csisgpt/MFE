import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import registry from '../libs/shared/config/src/registry.json' assert { type: 'json' };

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const deployDir = path.join(distDir, 'deploy');

const shellDist = path.join(distDir, 'apps', 'shell');
const runtimeSrc = path.join(rootDir, 'apps', 'shell', 'public', 'config', 'runtime.json');

await fs.rm(deployDir, { recursive: true, force: true });
await fs.mkdir(deployDir, { recursive: true });

await fs.cp(shellDist, deployDir, { recursive: true });

const remotesDir = path.join(deployDir, 'remotes');
await fs.mkdir(remotesDir, { recursive: true });

for (const remote of registry) {
  const source = path.join(distDir, 'apps', remote.projectName);
  const destination = path.join(remotesDir, remote.importKey);
  await fs.cp(source, destination, { recursive: true });
}

const configDir = path.join(deployDir, 'config');
await fs.mkdir(configDir, { recursive: true });
await fs.copyFile(runtimeSrc, path.join(configDir, 'runtime.json'));

const packageJson = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));
const healthPayload = {
  'نسخه': packageJson.version,
  'زمان‌ساخت': new Date().toISOString()
};
await fs.writeFile(path.join(deployDir, 'health.json'), JSON.stringify(healthPayload, null, 2), 'utf8');
