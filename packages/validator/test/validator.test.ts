import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  validateExecutionPlan,
  validateGovernancePolicy,
  validateSkillPack,
  validateSpurEnvelope,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');

function loadExample(fileName: string) {
  return JSON.parse(readFileSync(path.join(root, 'examples', fileName), 'utf8'));
}

describe('validator', () => {
  it('accepts valid examples', () => {
    expect(() => validateSpurEnvelope(loadExample('envelope.clean.json'))).not.toThrow();
    expect(() => validateSkillPack(loadExample('skill.clean-bathroom.json'))).not.toThrow();
    expect(() => validateGovernancePolicy(loadExample('policy.default.json'))).not.toThrow();
    expect(() => validateExecutionPlan(loadExample('plan.generated.json'))).not.toThrow();
  });

  it('rejects missing required fields', () => {
    const invalidEnvelope = loadExample('envelope.clean.json');
    delete invalidEnvelope.id;

    const invalidSkillPack = loadExample('skill.clean-bathroom.json');
    delete invalidSkillPack.name;

    const invalidPolicy = loadExample('policy.default.json');
    delete invalidPolicy.policyId;

    const invalidPlan = loadExample('plan.generated.json');
    delete invalidPlan.planId;

    expect(() => validateSpurEnvelope(invalidEnvelope)).toThrow(/required property/i);
    expect(() => validateSkillPack(invalidSkillPack)).toThrow(/required property/i);
    expect(() => validateGovernancePolicy(invalidPolicy)).toThrow(/required property/i);
    expect(() => validateExecutionPlan(invalidPlan)).toThrow(/required property/i);
  });

  it('rejects execution plan without integrity fields', () => {
    const missingHashPlan = loadExample('plan.generated.json');
    delete missingHashPlan.hash;

    const missingCreatedAtPlan = loadExample('plan.generated.json');
    delete missingCreatedAtPlan.createdAt;

    expect(() => validateExecutionPlan(missingHashPlan)).toThrow(/required property/i);
    expect(() => validateExecutionPlan(missingCreatedAtPlan)).toThrow(/required property/i);
  });
});
