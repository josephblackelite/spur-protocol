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

function typeName(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function isValidDateTime(value) {
  if (typeof value !== 'string') return false;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;
  // Require an explicit timezone designator for stricter date-time conformance.
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function validateSchema(value, schema, pathPrefix = '$') {
  const schemaErrors = [];

  if (Object.hasOwn(schema, 'const') && value !== schema.const) {
    schemaErrors.push(`${pathPrefix}: expected const ${JSON.stringify(schema.const)}`);
    return schemaErrors;
  }

  if (schema.type) {
    const actualType = typeName(value);
    if (actualType !== schema.type) {
      schemaErrors.push(`${pathPrefix}: expected type ${schema.type}, got ${actualType}`);
      return schemaErrors;
    }
  }

  if (schema.format === 'date-time' && !isValidDateTime(value)) {
    schemaErrors.push(`${pathPrefix}: expected format date-time`);
  }

  if (schema.type === 'object') {
    const objectValue = value;
    const properties = schema.properties ?? {};
    const required = schema.required ?? [];

    for (const req of required) {
      if (!Object.hasOwn(objectValue, req)) {
        schemaErrors.push(`${pathPrefix}: missing required property "${req}"`);
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(objectValue)) {
        if (!Object.hasOwn(properties, key)) {
          schemaErrors.push(`${pathPrefix}: additional property "${key}" is not allowed`);
        }
      }
    }

    for (const [propName, propSchema] of Object.entries(properties)) {
      if (!Object.hasOwn(objectValue, propName)) continue;
      schemaErrors.push(...validateSchema(objectValue[propName], propSchema, `${pathPrefix}.${propName}`));
    }
  }

  if (schema.type === 'array') {
    const itemSchema = schema.items;
    if (itemSchema) {
      value.forEach((item, index) => {
        schemaErrors.push(...validateSchema(item, itemSchema, `${pathPrefix}[${index}]`));
      });
    }
  }

  return schemaErrors;
}

const jsonFiles = [
  ...walk(path.join(root, 'schemas'), (p) => p.endsWith('.json')),
  ...walk(path.join(root, 'examples'), (p) => p.endsWith('.json')),
];

const parsedJson = new Map();
for (const file of jsonFiles) {
  try {
    parsedJson.set(file, JSON.parse(readFileSync(file, 'utf8')));
  } catch (error) {
    errors.push(`Invalid JSON in ${path.relative(root, file)}: ${error.message}`);
  }
}

const schemaFiles = walk(path.join(root, 'schemas'), (p) => p.endsWith('.schema.json'));
const schemasByBaseName = new Map();
for (const schemaPath of schemaFiles) {
  const schemaObject = parsedJson.get(schemaPath);
  if (!schemaObject) continue;
  const baseName = path.basename(schemaPath, '.schema.json');
  schemasByBaseName.set(baseName, schemaObject);
}

const exampleToSchema = [
  { regex: /^envelope\./i, schemaName: 'SpurEnvelope' },
  { regex: /^skill\./i, schemaName: 'SkillPack' },
  { regex: /^policy\./i, schemaName: 'GovernancePolicy' },
  { regex: /^plan\./i, schemaName: 'ExecutionPlan' },
];

for (const examplePath of walk(path.join(root, 'examples'), (p) => p.endsWith('.json'))) {
  const exampleObject = parsedJson.get(examplePath);
  if (!exampleObject) continue;

  const fileName = path.basename(examplePath);
  const mapping = exampleToSchema.find(({ regex }) => regex.test(fileName));

  if (!mapping) {
    continue;
  }

  const schema = schemasByBaseName.get(mapping.schemaName);
  if (!schema) {
    errors.push(`Missing schema for ${mapping.schemaName} while validating ${path.relative(root, examplePath)}`);
    continue;
  }

  const schemaValidationErrors = validateSchema(exampleObject, schema);
  for (const schemaError of schemaValidationErrors) {
    errors.push(`Schema mismatch in ${path.relative(root, examplePath)}: ${schemaError}`);
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
