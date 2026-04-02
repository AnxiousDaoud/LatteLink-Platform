# Versioning

Last reviewed: `2026-04-02`

## Purpose

This document defines the exact versioning flow for the remaining V1 work in this repo.

The goal is to keep release identity:

- explicit
- reviewable
- traceable to ticketed work
- consistent across `dev`, `main`, and deployment handoff

## Tooling

This repo already has `Changesets` configured in [/.changeset/config.json](../../.changeset/config.json).

Use that existing setup instead of manual version bookkeeping.

Use these commands from the repo root:

```bash
pnpm changeset
pnpm changeset:status
pnpm changeset:version
```

## Version Format

- use semantic versioning: `MAJOR.MINOR.PATCH`
- use `v` prefixes for Git tags and release references, for example `v0.2.0`
- use bare semantic versions in files and environment values, for example `0.2.0`

## Source Of Truth

The source of truth depends on the stage:

- pending version intent on `dev`: `.changeset/*.md`
- current package versions after a versioning pass: `package.json` files updated by `Changesets`
- release identifier for merged `main`: Git tag `vX.Y.Z`

Do not hand-edit package versions as ad hoc release bookkeeping.

## V1 Baseline

- keep the repo on the `0.x.y` line until the first real live V1 deployment is completed
- reserve `1.0.0` for the first live production deployment that completes `XS-V1-03`
- do not use a major bump before that unless the user explicitly approves an exception

## Choosing The Bump

Use the smallest honest bump.

- `patch`
  - bug fixes
  - security hardening
  - CI or workflow corrections
  - backward-compatible internal improvements
  - copy or content changes that do not materially expand product capability
- `minor`
  - new user-visible or operator-visible capability
  - new API endpoint or meaningful contract expansion
  - meaningful flow expansion across mobile, dashboard, admin, or backend behavior
  - new deployable capability needed for V1 readiness
- `major`
  - breaking behavior or contract reset
  - post-V1 release line change

If a ticket does not change release-facing behavior, use `version impact: none`.

## Ticket Rule

For each ticket, decide version impact before the ticket is considered done.

Use this rule:

- add a `Changesets` entry when the ticket changes shipped behavior, runtime behavior, contracts, deployable workflows, or release-facing functionality
- do not add a `Changesets` entry for docs-only, process-only, test-only, or local-only cleanup work
- if no version bump is needed, record that ticket as `version impact: none`

Each version-affecting ticket should carry its own `Changesets` entry so the version intent stays tied to the ticket that caused it.

## Per-Ticket Flow

1. Decide whether the ticket is `none`, `patch`, `minor`, or `major`.
2. If the answer is not `none`, run `pnpm changeset`.
3. Write the summary so it is specific to the ticket and the shipped behavior.
4. Commit the `Changesets` file with the ticket work on `dev`.
5. Push `dev` after the ticket commit as required by [development-flow.md](./development-flow.md).

Do not wait until the end of a section to guess the version impact of earlier tickets.

## Section-Close Versioning Flow

After all tickets in one top-level section are complete on `dev`:

1. run `pnpm changeset:status`
2. inspect the pending changesets and confirm the target release version is coherent
3. run `pnpm changeset:version`
4. review the generated package version and changelog updates
5. commit the versioning output on `dev`
6. push `dev`
7. open the `dev` to `main` PR with the target version called out explicitly

That section-close versioning commit is the last commit before opening the PR unless a fix is required.

## Pull Request Rule

Every `dev` to `main` PR must state:

- the target version, for example `0.2.0`
- the version impact summary, for example `minor`
- the included ticket IDs
- the verification run after the versioning pass

Do not open a section PR without making the version target explicit.

## Post-Merge Tagging

When a merged `main` state is accepted as the release candidate or deployment target:

1. sync local `main` to `origin/main`
2. create an annotated tag for that merged commit in the form `vX.Y.Z`
3. push the tag
4. use that tag in release notes and deployment tracking

Artifact image tags may still use commit SHAs. The semantic version tag is the human release identifier, not a replacement for SHA-based artifact identity.

## Mobile Release Alignment

If a release includes a mobile build, the selected release version must match the `APP_VERSION` used for that build.

Do not ship a mobile build with an app version that disagrees with the merged release version on `main`.
