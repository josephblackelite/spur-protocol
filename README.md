# Spur Protocol

Spur Protocol is an open standard for packaging, validating, and deploying robotics Skill Packs across heterogeneous autonomous fleets.

Task Envelope + Skill Pack + Governance Policy -> Execution Plan -> Fleet Runtime

## Terminology

Canonical terms are defined in [`spec/terminology.md`](spec/terminology.md).

## Repository structure

- `spec/` — normative and supporting protocol documentation, including the Fleet Runtime Contract (`spec/runtime-contract.md`).
- `schemas/` — machine-readable schema definitions (including `AuditEvent`).
- `examples/` — example payloads and conformance vectors (including audit event examples).

## Install

```sh
pnpm add @spurprotocol/types@^0.1.0 @spurprotocol/validator@^0.1.0 @spurprotocol/compiler@^0.1.0
npm i @spurprotocol/types@^0.1.0 @spurprotocol/validator@^0.1.0 @spurprotocol/compiler@^0.1.0
yarn add @spurprotocol/types@^0.1.0 @spurprotocol/validator@^0.1.0 @spurprotocol/compiler@^0.1.0
```

## Usage

Validate an envelope:

```ts
import { validateSpurEnvelope } from '@spurprotocol/validator';

const envelope = {
  version: '0.1.0',
  id: 'env-001',
  issuedAt: '2026-01-15T09:30:00Z',
  intent: {
    verb: 'clean',
    target: 'bathroom',
  },
  constraints: {},
  requiredCapabilities: ['surface-cleaning'],
};

validateSpurEnvelope(envelope);
```

Compile an `ExecutionPlan`:

```ts
import { compileExecutionPlan } from '@spurprotocol/compiler';

const plan = compileExecutionPlan({
  envelope,
  skill: {
    version: '0.1.0',
    skillId: 'skill-clean-bathroom-v1',
    name: 'Clean Bathroom',
    category: 'housekeeping',
    capabilitiesProvided: ['surface-cleaning'],
    inputs: {},
    steps: [{ stepId: 'step-1', action: 'Wipe sink surfaces' }],
  },
  policy: {
    version: '0.1.0',
    policyId: 'policy-default-v1',
    allowedVerbs: ['clean'],
    limits: {},
    audit: {},
  },
  robot: {
    version: '0.1.0',
    robotId: 'robot-001',
    capabilities: ['surface-cleaning'],
    limits: {},
    adapters: [],
  },
});

console.log(plan.hash, plan.planId);
```

Packages are versioned using SemVer. Current status remains Draft (v0.1).

## Status

Draft (v0.1 in progress)
