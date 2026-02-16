import type {
  AdapterContract,
  EnforcementDecision,
  GovernancePolicy,
  RobotProfile,
  SpurEnvelope,
} from '@spurprotocol/types';

type EnvelopeForExplain = {
  intent: { verb: string };
  requiredCapabilities: string[];
};

type PolicyForExplain = {
  policyId: string;
  allowedVerbs: string[];
  limits: Record<string, unknown>;
};

type RobotForExplain = {
  capabilities: string[];
};

type AdapterForExplain = {
  supportedVerbs: string[];
  supportedCapabilities: string[];
  constraintSupport: { speedLimit: boolean };
};

export type ExplainReport = {
  ok: boolean;
  decision: EnforcementDecision;
  missingCapabilities: string[];
  policyIssues: string[];
  adapterIssues: string[];
  suggestedFixes: string[];
};

function includesValue(values: readonly string[], value: string): boolean {
  return values.includes(value);
}

export function evaluateEnforcement(params: {
  envelope: SpurEnvelope;
  policy: GovernancePolicy;
  robot: RobotProfile;
  adapter: AdapterContract;
}): EnforcementDecision {
  const envelope = params.envelope as EnvelopeForExplain;
  const policy = params.policy as PolicyForExplain;
  const robot = params.robot as RobotForExplain;
  const adapter = params.adapter as AdapterForExplain;

  if (!includesValue(policy.allowedVerbs, envelope.intent.verb)) {
    return {
      mode: 'DENY',
      reason: `Verb '${envelope.intent.verb}' is not allowed by policy '${policy.policyId}'`,
    };
  }

  const missingCapabilities = envelope.requiredCapabilities.filter(
    (capability) => !includesValue(robot.capabilities, capability),
  );
  if (missingCapabilities.length > 0) {
    return {
      mode: 'DENY',
      reason: `Robot is missing required capabilities: ${missingCapabilities.join(', ')}`,
    };
  }

  const missingAdapterCapabilities = envelope.requiredCapabilities.filter(
    (capability) => !includesValue(adapter.supportedCapabilities, capability),
  );
  if (!includesValue(adapter.supportedVerbs, envelope.intent.verb) || missingAdapterCapabilities.length > 0) {
    return {
      mode: 'DENY',
      reason: 'Adapter cannot execute the requested envelope requirements',
    };
  }

  const speedLimitConfigured = typeof policy.limits === 'object' && policy.limits !== null && 'speedLimit' in policy.limits;
  if (speedLimitConfigured && adapter.constraintSupport.speedLimit !== true) {
    return {
      mode: 'DENY',
      reason: 'Policy speed limit cannot be enforced by adapter',
    };
  }

  return {
    mode: 'ALLOW',
    reason: 'Envelope is runnable with the provided policy, robot, and adapter',
  };
}

export function explainWhyNotRunnable(params: {
  envelope: SpurEnvelope;
  policy: GovernancePolicy;
  robot: RobotProfile;
  adapter: AdapterContract;
}): ExplainReport {
  const decision = evaluateEnforcement(params);
  if (decision.mode === 'ALLOW') {
    return {
      ok: true,
      decision,
      missingCapabilities: [],
      policyIssues: [],
      adapterIssues: [],
      suggestedFixes: [],
    };
  }

  const envelope = params.envelope as EnvelopeForExplain;
  const policy = params.policy as PolicyForExplain;
  const robot = params.robot as RobotForExplain;
  const adapter = params.adapter as AdapterForExplain;

  const missingCapabilities = envelope.requiredCapabilities.filter(
    (capability) => !includesValue(robot.capabilities, capability),
  );

  const policyIssues: string[] = [];
  if (!includesValue(policy.allowedVerbs, envelope.intent.verb)) {
    policyIssues.push(`Verb '${envelope.intent.verb}' is not allowed by GovernancePolicy.allowedVerbs`);
  }

  const adapterIssues: string[] = [];
  if (!includesValue(adapter.supportedVerbs, envelope.intent.verb)) {
    adapterIssues.push(`Adapter does not support verb '${envelope.intent.verb}'`);
  }

  const missingAdapterCapabilities = envelope.requiredCapabilities.filter(
    (capability) => !includesValue(adapter.supportedCapabilities, capability),
  );

  for (const capability of missingAdapterCapabilities) {
    adapterIssues.push(`Adapter does not support capability '${capability}'`);
  }

  const speedLimitConfigured = typeof policy.limits === 'object' && policy.limits !== null && 'speedLimit' in policy.limits;
  if (speedLimitConfigured && adapter.constraintSupport.speedLimit !== true) {
    adapterIssues.push('Adapter cannot enforce policy speed limit');
  }

  const suggestedFixes: string[] = [];
  for (const capability of missingCapabilities) {
    suggestedFixes.push(`Add capability '${capability}' to RobotProfile.capabilities`);
  }

  if (!includesValue(policy.allowedVerbs, envelope.intent.verb)) {
    suggestedFixes.push(`Add verb '${envelope.intent.verb}' to GovernancePolicy.allowedVerbs`);
  }

  if (!includesValue(adapter.supportedVerbs, envelope.intent.verb)) {
    suggestedFixes.push(`Use an adapter that supports verb '${envelope.intent.verb}'`);
  }

  for (const capability of missingAdapterCapabilities) {
    suggestedFixes.push(`Use an adapter that supports capability '${capability}'`);
  }

  if (speedLimitConfigured && adapter.constraintSupport.speedLimit !== true) {
    suggestedFixes.push('Use an adapter with constraintSupport.speedLimit = true');
  }

  return {
    ok: false,
    decision,
    missingCapabilities,
    policyIssues,
    adapterIssues,
    suggestedFixes,
  };
}
