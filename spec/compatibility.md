# Compatibility

## Spur Compatible

A Runtime or integration is Spur Compatible at a high level when it can:

- ingest SkillPack format,
- accept ExecutionPlan,
- enforce GovernancePolicy constraints,
- ingest `AdapterContract` and expose declared interop contexts plus constraint support, and
- emit audit events conforming to AuditEvent.schema.json.

## Conformance artifacts

The `examples/` directory will provide test vectors and reference payloads used for conformance validation.
