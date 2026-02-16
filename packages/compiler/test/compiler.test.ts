import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compileExecutionPlan } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');

function loadExample(fileName: string) {
  return JSON.parse(readFileSync(path.join(root, 'examples', fileName), 'utf8'));
}

describe('compileExecutionPlan', () => {
  it('compiles a valid execution plan from examples', () => {
    const envelope = loadExample('envelope.clean.json');
    const skill = loadExample('skill.clean-bathroom.json');
    const policy = loadExample('policy.default.json');
    const robot = loadExample('robot.default.json');

    const plan = compileExecutionPlan({ envelope, skill, policy, robot });

    expect(plan).toEqual({
      version: '0.1.0',
      planId: `${envelope.id}-plan`,
      sourceEnvelopeId: envelope.id,
      steps: skill.steps,
      auditRequirements: policy.audit,
    });
  });

  it('throws when verb is disallowed', () => {
    const envelope = loadExample('envelope.clean.json');
    const skill = loadExample('skill.clean-bathroom.json');
    const policy = loadExample('policy.default.json');
    const robot = loadExample('robot.default.json');

    envelope.intent.verb = 'deliver';

    expect(() => compileExecutionPlan({ envelope, skill, policy, robot })).toThrow(/not allowed/i);
  });

  it('throws when robot is missing a required capability', () => {
    const envelope = loadExample('envelope.clean.json');
    const skill = loadExample('skill.clean-bathroom.json');
    const policy = loadExample('policy.default.json');
    const robot = loadExample('robot.default.json');

    robot.capabilities = ['surface-cleaning'];

    expect(() => compileExecutionPlan({ envelope, skill, policy, robot })).toThrow(/robot does not satisfy/i);
  });
});
