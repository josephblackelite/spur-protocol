#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredPaths = [
  'README.md',
  'spec',
  'schemas',
  'examples',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'GOVERNANCE.md',
  '.github/workflows/ci.yml',
  'spec/terminology.md',
];

const prohibitedTerms = ['mission envelope', 'mission export', 'capability envelope'];

const errors = [];

for (const relPath of requiredPaths) {
  if (!existsSync(path.join(root, relPath))) {
    errors.push(`Missing required path: ${relPath}`);
  }
}

function walk(dir, matcher, acc = []) {
  if (!existsSync(dir)) return acc;

  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);

    if (st.isDirectory()) {
      walk(full, matcher, acc);
      continue;
    }

    if (matcher(full)) {
      acc.push(full);
    }
  }

  return acc;
}

const jsonFiles = [
  ...walk(path.join(root, 'schemas'), (p) => p.endsWith('.json')),
  ...walk(path.join(root, 'examples'), (p) => p.endsWith('.json')),
];

for (const file of jsonFiles) {
  try {
    JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`Invalid JSON in ${path.relative(root, file)}: ${error.message}`);
  }
}

const markdownFiles = [path.join(root, 'README.md'), ...walk(path.join(root, 'spec'), (p) => p.endsWith('.md'))];

for (const file of markdownFiles) {
  const content = readFileSync(file, 'utf8');

  for (const term of prohibitedTerms) {
    if (content.includes(term)) {
      errors.push(`Prohibited term "${term}" found in ${path.relative(root, file)}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Validation failed:');
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log('Validation passed.');
