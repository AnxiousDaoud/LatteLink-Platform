# Changelog

All notable release changes to this project are recorded here.

The authoritative changelog policy lives in [development-flow.md](/Users/yazan/Documents/Gazelle/Dev/GazelleMobilePlatform/docs/runbooks/development-flow.md).

## Unreleased

- No release entries recorded yet under the new workflow.

## v1.0.1 - 2026-05-04

- Capped Postgres client pools for DB-backed services to keep the free Supabase session pool below its client limit.
- Added configurable Postgres pool timeout settings for safer overload behavior.

## v1.0.0 - 2026-04-28

- Released the Gate 1 pilot-safety baseline after production deploy validation.
- Added dev/prod environment separation, automated deploy workflows, and restore-drill validation.
- Shipped pilot readiness systems: structured logging, Sentry, uptime checks, launch readiness, stale payment reconciliation, loyalty scoping, tenant-isolation hardening, and support tooling.
