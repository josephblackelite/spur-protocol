import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  validateAdapterContract,
  validateAuditEvent,
  validateExecutionPlan,
  validateGovernancePolicy,
  validateRobotProfile,
  validateSkillDemonstration,
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
    expect(() => validateRobotProfile(loadExample('robot.default.json'))).not.toThrow();
    expect(() => validateAdapterContract(loadExample('adapter.sim.json'))).not.toThrow();
    expect(() => validateAuditEvent(loadExample('audit.plan-started.json'))).not.toThrow();
    expect(() => validateAuditEvent(loadExample('audit.step-completed.json'))).not.toThrow();
    expect(() => validateAuditEvent(loadExample('audit.plan-completed.json'))).not.toThrow();
    expect(() => validateSkillDemonstration(loadExample('demonstration.sample.json'))).not.toThrow();
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

  it('rejects a skill demonstration missing consent', () => {
    const invalidDemonstration = loadExample('demonstration.sample.json');
    delete invalidDemonstration.consent;

    expect(() => validateSkillDemonstration(invalidDemonstration)).toThrow(/required property/i);
  });

  it('rejects a skill demonstration with a malformed media hash', () => {
    const invalidDemonstration = loadExample('demonstration.sample.json');
    invalidDemonstration.media[0].hash = 'not-a-valid-hash';

    expect(() => validateSkillDemonstration(invalidDemonstration)).toThrow(/must match pattern/i);
  });

  it('rejects a skill demonstration missing signature or contributorPublicKey', () => {
    const missingSignature = loadExample('demonstration.sample.json');
    delete missingSignature.signature;

    const missingPublicKey = loadExample('demonstration.sample.json');
    delete missingPublicKey.contributorPublicKey;

    expect(() => validateSkillDemonstration(missingSignature)).toThrow(/required property/i);
    expect(() => validateSkillDemonstration(missingPublicKey)).toThrow(/required property/i);
  });
});
