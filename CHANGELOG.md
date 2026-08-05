# Changelog

All notable changes to Spur Protocol are documented in this file.

## 0.2.0

### Added

- `SkillDemonstration` supporting schema (`schemas/SkillDemonstration.schema.json`), TS type, and `validateSkillDemonstration` validator. It records a human demonstrating a SkillPack's task — media references, a consent/licensing grant, and a review status — used to source and license training data. It is independent of the core Task Envelope + SkillPack + Governance Policy -> Execution Plan -> Runtime pipeline and does not participate in `compileExecutionPlan`.
- Example fixture `examples/demonstration.sample.json` for `SkillDemonstration`.
- Missing TS types and validators for previously schema-only objects:
  - `validateRobotProfile` (the `RobotProfile` TS type already existed; the validator function was missing).
  - `AdapterContract` TS type and `validateAdapterContract` validator.
  - `AuditEvent` TS type and `validateAuditEvent` validator.
- Validator test coverage for the four validators above, including happy-path checks against existing example fixtures and negative cases for `SkillDemonstration`.
- Documentation: `SkillDemonstration` added to `spec/terminology.md` (Supporting terms) and `spec/overview.md`; hash-format convention documented in `spec/versioning.md`.

### Changed

- Bumped the `version` const from `0.1.0` to `0.2.0` in all seven existing schemas (`SpurEnvelope`, `SkillPack`, `GovernancePolicy`, `ExecutionPlan`, `RobotProfile`, `AdapterContract`, `AuditEvent`). This is a backward-compatible additive release: no existing schema gained a new required field, per the MINOR bump policy in `spec/versioning.md`.
- Updated the `version` field in all existing example fixtures to `0.2.0` to match.
- Bumped package versions to `0.2.0` for the root package and `@spurprotocol/types`, `@spurprotocol/validator`, and `@spurprotocol/compiler`.

### Notes

- `ExecutionPlan.hash` keeps its original bare-hex format (no `sha256:` prefix) and its existing hard-coded test fixture value. It is explicitly not changed by this release. See `spec/versioning.md` for the hash-format convention going forward.
