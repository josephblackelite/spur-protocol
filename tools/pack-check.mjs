import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const packages = ['types', 'validator', 'compiler'];
const allowed = [
  /^package\/package\.json$/,
  /^package\/dist\//,
  /^package\/README(?:\.md)?$/i,
  /^package\/LICENSE(?:\.md)?$/i,
];
const blocked = [/^package\/src\//, /^package\/test\//];

function run(cmd, args, cwd = root) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();
}

console.log('Building workspace packages...');
run('pnpm', ['-r', 'build']);

for (const pkg of packages) {
  const cwd = join(root, 'packages', pkg);
  console.log(`\nChecking package: ${pkg}`);
  const tarball = run('npm', ['pack', '--silent'], cwd).split(/\r?\n/).pop();
  if (!tarball) {
    throw new Error(`Could not determine tarball name for ${pkg}`);
  }

  const files = run('tar', ['-tf', tarball], cwd)
    .split(/\r?\n/)
    .map((f) => f.trim())
    .filter(Boolean);

  const disallowed = files.filter(
    (file) => !allowed.some((pattern) => pattern.test(file)),
  );
  const blockedHits = files.filter((file) => blocked.some((pattern) => pattern.test(file)));

  try {
    if (blockedHits.length > 0 || disallowed.length > 0) {
      const details = [
        blockedHits.length ? `blocked paths: ${blockedHits.join(', ')}` : '',
        disallowed.length ? `unexpected paths: ${disallowed.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('; ');
      throw new Error(`Package ${pkg} failed pack content validation (${details})`);
    }

    console.log(`✔ ${pkg} tarball contents are publish-safe (${files.length} entries)`);
  } finally {
    const tarPath = join(cwd, tarball);
    if (existsSync(tarPath)) {
      rmSync(tarPath);
    }
  }
}

console.log('\nPack check completed successfully.');
