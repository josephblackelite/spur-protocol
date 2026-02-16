# Fleet Runtime Contract

A Fleet Runtime is responsible for executing canonical Spur artifacts in a deterministic, policy-aware, and auditable way.

## Responsibilities

A conformant Fleet Runtime MUST:

- ingest `ExecutionPlan` inputs and prepare them for execution,
- enforce `GovernancePolicy` constraints at execution time,
- bind execution to a target `RobotProfile`, and
- emit `AuditEvent` records as append-only log entries.

Audit output MUST be JSONL friendly: each event is a standalone JSON object that can be appended to an ordered event stream without mutation.

## Minimum required audit events

For any execution run, a Fleet Runtime MUST emit, at minimum, canonical `AuditEvent.type` values that cover the full run lifecycle:

- `PLAN_ACCEPTED`
- `PLAN_STARTED`
- `STEP_STARTED`
- `STEP_COMPLETED` or `STEP_FAILED`
- `PLAN_COMPLETED` or `PLAN_ABORTED`

These events establish a minimum interoperable trace for acceptance, step progression, outcomes, and terminal run status.

## Adapter behavior and interoperability

Runtime adapters may translate canonical execution semantics into implementation-specific Interop Contexts (for example ROS2, VDA 5050, or vendor APIs). However, adapters MUST continue to emit canonical `AuditEvent` entries conforming to `schemas/AuditEvent.schema.json` so that audit analysis remains portable across fleets.
