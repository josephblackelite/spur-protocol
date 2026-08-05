# Spur — Company Build Roadmap

Three components, one company:

- **Spur Protocol** (this repo) — the open language. Free, downloadable, on GitHub.
- **Spur Studio** (`spurstudio`) — the app people use to build, pack, and submit a skill.
- **Spur Store** (`spurstore.com`, not yet created) — the public marketplace: search skills, see ratings and badges, buy a license, download Studio.

Flow: someone builds/records in Studio → their skill is packed and validated against the Protocol → it's listed on the Store, badge-gated if it's a licensed/professional skill → robotics and AI companies license what they need.

This file is the single source of truth for what phase we're in. Checkboxes are meant to be checked against real, verifiable state — a box only gets checked when the thing it describes is actually true in the repo, not when it's "mostly done." Re-read this file before starting new work so nothing gets duplicated.

Audited against actual repo contents on 2026-08-05 (not assumptions from folder/file names).

---

## Baseline — what's actually true today

**Spur Protocol** is real but early (Draft v0.1.0): 7 JSON schemas, but only 4 of 7 (`SpurEnvelope`, `SkillPack`, `GovernancePolicy`, `ExecutionPlan`) have working validators and exported types. `RobotProfile` has a type but no validator. `AdapterContract` and `AuditEvent` have neither, despite having schema files and example fixtures. The compiler (`compileExecutionPlan`) works and produces a deterministic SHA-256 hash, but never validates its own inputs — callers have to do that themselves. Nothing in any schema today models who demonstrated a skill, what media proves it, what license it's offered under, or whether it's been reviewed.

**Spur Studio** is further along than it looks from the outside: there's a real, working CLI (`spur`, 11 commands — `init/validate/compile/run/report/doctor/explain/simulate/bundle/verify-bundle/version`), a real execution runtime with governance enforcement and an audited JSONL trail, and a bundle packager that can already sign (HMAC) and zip a directory with a tamper-evident manifest. But: **the CLI's `validate` command is currently broken** — it calls validator function names (`validateEnvelope`, `validateSkill`, etc.) that don't match what `@spurprotocol/validator` actually exports (`validateSpurEnvelope`, `validateSkillPack`, etc.), so real protocol validation silently never runs today. And there is **no web server, API, or frontend anywhere in either repo** — confirmed by exhaustive search, not assumption. There is nowhere to submit anything to yet.

**Spur Store** doesn't exist as code yet. Domain registration is in progress (you're handling it). Hosting will follow the same pattern already running for `nwudu.com` on the shared EC2 box (Node/PM2 behind Nginx, atomic timestamped releases, its own Let's Encrypt cert) — details in `spurstudio/.cursorrules.txt`, which is now gitignored and was never committed or pushed.

---

## Phase 0 — Fix what's already broken

Small, low-risk, no new concepts. Do this before building on top of either repo.

- [ ] `spurstudio`: fix `validateWithSpurValidator()` in `packages/cli/src/index.ts` to call the real exported names (`validateSpurEnvelope`, `validateSkillPack`, `validateGovernancePolicy`, `validateExecutionPlan`) instead of the non-existent ones it calls today
- [ ] `spurstudio`: update `INSTALL.md` — its documented `bundle`/`verify-bundle` flags don't match the real CLI (`--envelope/--skill/--policy/--robot/--adapter --out`, `--dir|--zip`)
- [ ] `spur-protocol`: add the missing `validateRobotProfile` to `@spurprotocol/validator`
- [ ] `spur-protocol`: add `AdapterContract` and `AuditEvent` to both `@spurprotocol/types` and `@spurprotocol/validator` (schemas and example fixtures already exist for both — only the code binding is missing)
- [ ] `spur-protocol`: add the `CHANGELOG.md` that `GOVERNANCE.md` already claims exists
- [ ] `spur-protocol`: fill the `[INSERT CONTACT METHOD]` placeholder in `CODE_OF_CONDUCT.md` and name an actual channel in `SECURITY.md`

---

## Phase 1 — Extend the language: `SkillDemonstration`

This is "tighten the language." New concept, additive, versioned as a `0.2.0` minor-or-major bump per the existing policy in `spec/versioning.md`.

- [ ] **Decision needed:** is `SkillDemonstration` a fifth core object (alongside Envelope/SkillPack/Policy/Plan) or a supporting schema like `RobotProfile`/`AdapterContract`/`AuditEvent`? This changes `spec/terminology.md` and `spec/overview.md`'s pipeline diagram.
- [ ] Add `schemas/SkillDemonstration.schema.json` — references `SkillPack` by `skillId` (matches the existing FK-by-string-ID convention already used everywhere else, e.g. `ExecutionPlan.sourceEnvelopeId`); does **not** modify `SkillPack.steps[]` itself. Fields:
  - `demonstrationId`, `skillId`, `contributorId` (external reference — see Phase 3 identity decision), `submittedAt`
  - `media`: array of `{ type, uri, hash }` — references external storage, doesn't embed binary data
  - `consent`: licensing/usage terms — properly typed, not a bare `{"type":"object"}` escape hatch like the protocol's existing `limits`/`audit`/`constraints` fields
  - `reviewStatus`: enum `pending | approved | rejected`
- [ ] **Decision needed:** hash format convention. The repo is currently inconsistent — `ExecutionPlan.hash` is a bare hex SHA-256, `AuditEvent` examples use an `"sha256:"`-prefixed string. Pick one and document it in `spec/`, since `SkillDemonstration.media[].hash` needs to follow a stated convention, not invent a third one.
- [ ] Add a properly-typed consent/likeness/physical-safety field to `GovernancePolicy` (or a sibling `ConsentPolicy` schema) — today's `limits`/`audit` fields are documented and exemplified only for operational limits and audit-log config; consent isn't a supported extension point yet, it's a clean-slate addition
- [ ] Wire `SkillDemonstration` into `@spurprotocol/types`, `@spurprotocol/validator`, and extend `tools/validate.mjs`'s filename-pattern list — it currently infers schema-per-example by filename regex and has no entry for a demonstration-prefixed file, so a new schema would silently go unchecked by CI until this list is updated
- [ ] Add example fixtures under `examples/` and matching tests in `packages/validator/test/`

---

## Phase 2 — Studio: record, pack, sign, submit

- [ ] New CLI command(s) in `spurstudio` (e.g. `spur demo pack`, `spur demo submit`) that build a valid `SkillDemonstration` record from a media reference + metadata, and validate it locally before anything leaves the machine
- [ ] **Decision needed / real blocker:** today's bundle signing (`packages/bundles/src/signing.ts`) is symmetric HMAC with one shared secret string. That works when the signer and verifier are the same party (compliance bundles) — it does **not** work for an open marketplace where thousands of independent contributors each need their own verifiable identity. This needs to move to per-contributor asymmetric signing (keypair) or be bound to whatever identity system Phase 3 settles on, before public submission opens.
- [ ] Generalize `createComplianceBundle()`'s packaging primitives (`zipDirectory`, manifest hashing — already generic under the hood) into a command that can sign+zip an arbitrary `SkillDemonstration` payload, not just the fixed 8-file compliance-bundle shape it's scoped to today
- [ ] Add the actual submission call (HTTP POST of the signed bundle) once Phase 3's ingestion endpoint exists — there's nothing to point it at yet

---

## Phase 3 — Build the infrastructure that doesn't exist yet

None of this exists in either repo today — confirmed, not assumed.

- [ ] Ingestion API: accept a signed `SkillDemonstration` bundle, verify signature + schema, store it
- [ ] **Decision needed:** identity — does "Human Index" (the GeoSpur verified-professional layer) already expose anything `contributorId` could reference, or does this need its own minimal account system first? This is a real dependency to confirm before Phase 1's `contributorId` field means anything.
- [ ] Media storage: raw video/motion-capture at scale is a poor fit for EC2 local disk — plan for object storage (e.g. S3) even though the app server itself runs on the same EC2 box as `nwudu.com`
- [ ] Review/moderation queue backing the `reviewStatus` field (this is the "people can submit junk" problem)
- [ ] Rating system
- [ ] Verification badge for licensed/professional skills, gated on verified contributor identity

---

## Phase 4 — spurstore.com

Doesn't exist as code yet.

- [ ] Scaffold the project (**decision needed:** match `nwudu.com`'s stack — Node/`vinext`/PM2 — for operational consistency with the existing deploy pattern, or use something else)
- [ ] Landing page — direct, says what it is: *"Sell your skills to robotic companies. Download Studio."*
- [ ] Searchable skill catalog
- [ ] Skill detail page: rating, badge, license terms
- [ ] Points to Studio for the actual submission flow rather than reimplementing it in the browser

---

## Phase 5 — Deploy

Do not start this phase without an explicit go-ahead at the time — it touches the shared production server.

- [ ] Follow the exact pattern already running for `nwudu.com` (per `spurstudio/.cursorrules.txt`): `/var/www/spurstore/releases/<timestamp>`, its own PM2 process name, its own internal port, its own Nginx vhost, its own Let's Encrypt cert
- [ ] DNS: point `spurstore.com` at the same EC2 IP once the domain is registered

---

## Phase 6 — Go-to-market

- [ ] Recruit the first cohort of Human-Index-verified contributors into Studio
- [ ] Once there's real submission volume, approach the already-identified buyers (Tesla, Figure AI, Agility Robotics, Physical Intelligence, Skild AI) with a sample licensed dataset
