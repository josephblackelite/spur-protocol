# Changelog

All notable changes to Spur Protocol are documented in this file.

## 0.3.0

### Changed (breaking, `SkillDemonstration` only)

- `SkillDemonstration` gains two new required fields: `contributorPublicKey` (PEM-encoded Ed25519 SPKI public key) and `signature` (base64-encoded Ed25519 signature). The signature covers the canonical (stably-stringified) payload with only `signature` itself omitted -- `contributorPublicKey` is covered, so the claimed identity can't be swapped onto a stolen signature after the fact.
- This replaces the compliance-bundle HMAC shared-secret signing model for demonstration submissions specifically: a shared secret can't work once submission is open to independent contributors who don't share a secret with the verifier. Asymmetric per-contributor keypairs do.
- Breaking change to `SkillDemonstration` alone (introduced hours earlier in 0.2.0, with no real external consumers yet) -- acceptable under SemVer's 0.y.z "anything may change" allowance for a Draft-status protocol. `SpurEnvelope`, `SkillPack`, `GovernancePolicy`, `ExecutionPlan`, `RobotProfile`, `AdapterContract`, and `AuditEvent` are all unchanged in shape; their `version` const is bumped to `0.3.0` alongside `SkillDemonstration` to keep the whole schema family on one protocol version number, per existing convention.

### Added

- `@spurprotocol/compiler` now publicly exports `stableStringify` (previously internal to `normalize.ts`) so any package that needs to sign or hash a Spur object -- Studio's signing commands, a verifying server -- uses the exact same canonicalization the compiler itself uses for `ExecutionPlan.hash`, rather than each reimplementing it slightly differently and risking silent signature-mismatch bugs.

### Notes

- `examples/demonstration.sample.json` now carries a real Ed25519 keypair-signed payload, generated and self-verified as part of this change, not a placeholder.

## 0.2.1 (`@spurprotocol/validator` only)

### Fixed

- `@spurprotocol/validator` imported its JSON schemas via a monorepo-relative path (`../../../schemas/*.schema.json`). That path only resolves inside this repo's own working tree — once the package was installed from npm anywhere else, the import silently threw `MODULE_NOT_FOUND`, which `@spurstudio/cli`'s `validate` command (and any other consumer with equivalent error handling) caught and treated as "nothing to validate," so every validation call silently no-op'd regardless of input. This affected every published version, including 0.2.0.
- Fix: the seven schemas are now copied into `packages/validator/src/schemas/` at build time (`scripts/copy-schemas.mjs`, generated fresh from the root `schemas/` directory on every build — never hand-edit the copy) and imported via a local relative path. `tsc` copies these into `dist/schemas/` alongside the compiled JS, so the published tarball is now self-contained.
- Verified by installing the packed tarball into a throwaway project entirely outside this repo and confirming `validateSpurEnvelope` both rejects an invalid envelope and accepts a valid one against the real installed package — not just against local `dist/` inside the monorepo.
- `@spurprotocol/types` and `@spurprotocol/compiler` were not affected: `types`' schema imports are type-only and erased at compile time (its compiled output has no runtime schema reference at all), and `compiler` never imports schema files directly.

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
