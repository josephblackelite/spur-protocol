import { createHash } from 'node:crypto';

import { ExecutionPlan, GovernancePolicy, SkillPack, SpurEnvelope } from '@spur/types';

import { stableStringify } from './normalize.js';

type EnvelopeForCompilation = {
  id: string;
  issuedAt: string;
  intent: { verb: string };
  requiredCapabilities: string[];
};

type SkillForCompilation = {
  capabilitiesProvided: string[];
  steps: Array<{ stepId: string; action: string }>;
};

type PolicyForCompilation = {
  policyId: string;
  allowedVerbs: string[];
  audit: Record<string, unknown>;
};

function hasAllCapabilities(available: string[], required: string[]): boolean {
  return required.every((capability) => available.includes(capability));
}

export function compileExecutionPlan(params: {
  envelope: SpurEnvelope;
  skill: SkillPack;
  policy: GovernancePolicy;
  robot: any;
}): ExecutionPlan {
  const envelope = params.envelope as EnvelopeForCompilation;
  const skill = params.skill as SkillForCompilation;
  const policy = params.policy as PolicyForCompilation;
  const { robot } = params;

  if (!policy.allowedVerbs.includes(envelope.intent.verb)) {
    throw new Error(
      `Compilation failed: verb "${envelope.intent.verb}" is not allowed by policy "${policy.policyId}"`,
    );
  }

  if (!hasAllCapabilities(skill.capabilitiesProvided, envelope.requiredCapabilities)) {
    throw new Error('Compilation failed: skill does not satisfy all required capabilities');
  }

  const robotCapabilities = Array.isArray(robot?.capabilities) ? robot.capabilities : [];
  if (!hasAllCapabilities(robotCapabilities, envelope.requiredCapabilities)) {
    throw new Error('Compilation failed: robot does not satisfy all required capabilities');
  }

  const planWithoutHash = {
    version: '0.1.0',
    planId: `${envelope.id}-plan`,
    sourceEnvelopeId: envelope.id,
    createdAt: envelope.issuedAt,
    steps: skill.steps,
    auditRequirements: policy.audit,
  };

  const normalizedPlan = stableStringify(planWithoutHash);
  const hash = createHash('sha256').update(normalizedPlan).digest('hex');

  return {
    ...planWithoutHash,
    hash,
  } as ExecutionPlan;
}
