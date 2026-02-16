import { describe, expect, it } from 'vitest';

import type { AdapterContract, GovernancePolicy, RobotProfile, SpurEnvelope } from '@spurprotocol/types';

import { explainWhyNotRunnable } from '../src/index.js';

function buildFixture() {
  const envelope: SpurEnvelope = {
    version: '0.1.0',
    id: 'env-001',
    issuedAt: '2026-01-01T00:00:00Z',
    intent: {
      verb: 'clean',
      target: 'kitchen',
    },
    constraints: {},
    requiredCapabilities: ['surface-cleaning'],
  };

  const policy: GovernancePolicy = {
    version: '0.1.0',
    policyId: 'policy-001',
    allowedVerbs: ['clean'],
    limits: {},
    audit: {},
  };

  const robot: RobotProfile = {
    version: '0.1.0',
    robotId: 'robot-001',
    capabilities: ['surface-cleaning'],
    limits: {
      maxPayloadKg: 10,
      maxShiftMinutes: 480,
    },
    adapters: ['adapter-sim-http-01'],
  };

  const adapter: AdapterContract = {
    version: '0.1.0',
    adapterId: 'adapter-sim-http-01',
    name: 'Simulation + HTTP Adapter',
    interopContexts: ['SIM', 'HTTP_API'],
    supportedVerbs: ['clean'],
    supportedCapabilities: ['surface-cleaning'],
    constraintSupport: {
      speedLimit: true,
      forceLimit: true,
      zoneEnforcement: true,
      approvalGates: true,
    },
    auditSupport: {
      emitsAuditEvents: true,
      minimumEventSet: ['PLAN_STARTED', 'STEP_STARTED', 'STEP_COMPLETED', 'PLAN_COMPLETED'],
    },
    endpoint: {
      type: 'http',
      uri: 'https://adapter.example.test/run',
    },
  };

  return { envelope, policy, robot, adapter };
}

describe('explainWhyNotRunnable', () => {
  it('returns ok=false for missing robot capability and suggests capability fix', () => {
    const fixture = buildFixture();
    fixture.robot.capabilities = [];

    const report = explainWhyNotRunnable(fixture);

    expect(report.ok).toBe(false);
    expect(report.missingCapabilities).toContain('surface-cleaning');
    expect(report.suggestedFixes).toContain("Add capability 'surface-cleaning' to RobotProfile.capabilities");
  });

  it('returns ok=true when envelope is runnable', () => {
    const report = explainWhyNotRunnable(buildFixture());

    expect(report.ok).toBe(true);
    expect(report.decision.mode).toBe('ALLOW');
    expect(report.missingCapabilities).toEqual([]);
    expect(report.policyIssues).toEqual([]);
    expect(report.adapterIssues).toEqual([]);
    expect(report.suggestedFixes).toEqual([]);
  });
});
