// Copies the single-source-of-truth schemas from the repo root into this
// package's src/ tree so they compile (and publish) as part of this package,
// rather than being referenced by a monorepo-relative path that doesn't
// exist once the package is installed from npm.
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');
const source = join(repoRoot, 'schemas');
const dest = join(here, '..', 'src', 'schemas');

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

for (const file of readdirSync(source)) {
  if (file.endsWith('.schema.json')) {
    cpSync(join(source, file), join(dest, file));
  }
}

console.log(`Copied schemas from ${source} to ${dest}`);
