# Versioning

Spur Protocol uses Semantic Versioning for specifications and schemas.

- **MAJOR**: breaking changes that require consumer updates, including removals, incompatible structural changes, or altered normative behavior.
- **MINOR**: backward-compatible additions, including new optional fields, clarifications, and additive capabilities.
- **PATCH**: backward-compatible corrections, editorial fixes, and non-normative clarifications.

## Breaking changes

A change is breaking if a previously valid payload becomes invalid, if required behavior changes incompatibly, or if mandatory fields are removed or redefined.

## Deprecation policy

Features are first marked deprecated in a MINOR release with migration guidance. Removal occurs only in a subsequent MAJOR release.
