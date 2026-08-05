# Versioning

Spur Protocol uses Semantic Versioning for specifications and schemas.

- **MAJOR**: breaking changes that require consumer updates, including removals, incompatible structural changes, or altered normative behavior.
- **MINOR**: backward-compatible additions, including new optional fields, clarifications, and additive capabilities.
- **PATCH**: backward-compatible corrections, editorial fixes, and non-normative clarifications.

## Breaking changes

A change is breaking if a previously valid payload becomes invalid, if required behavior changes incompatibly, or if mandatory fields are removed or redefined.

## Deprecation policy

Features are first marked deprecated in a MINOR release with migration guidance. Removal occurs only in a subsequent MAJOR release.

## Hash format convention

New hash-bearing fields introduced from 0.2.0 onward (for example, `SkillDemonstration.media[].hash`) must use the `sha256:`-prefixed format (`sha256:<64 lowercase hex characters>`), matching the existing `AuditEvent` convention (`planHash`).

`ExecutionPlan.hash` predates this convention and keeps its original bare-hex format (no `sha256:` prefix) for backward compatibility. It is not being changed by the 0.2.0 release.
