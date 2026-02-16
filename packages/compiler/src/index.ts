import { ExecutionPlan, GovernancePolicy, SkillPack, SpurEnvelope } from '@spur/types';

function hasAllCapabilities(available: string[], required: string[]): boolean {
  return required.every((capability) => available.includes(capability));
}

export function compileExecutionPlan(params: {
  envelope: SpurEnvelope;
  skill: SkillPack;
  policy: GovernancePolicy;
  robot: any;
}): ExecutionPlan {
  const { envelope, skill, policy, robot } = params;

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

  return {
    version: '0.1.0',
    planId: `${envelope.id}-plan`,
    sourceEnvelopeId: envelope.id,
    steps: skill.steps,
    auditRequirements: policy.audit,
  };
}
