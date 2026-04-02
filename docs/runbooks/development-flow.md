# Development Flow

Last reviewed: `2026-04-02`

## Purpose

This document defines the exact development flow for all remaining V1 work in this repo.

The goal is to keep every change:

- ticketed
- traceable
- committed on `dev`
- pushed to `origin/dev`
- merged to `main` through section-based pull requests

## Branch Model

- `main`
  - release branch
  - only receives changes through pull requests from `dev`
  - no direct implementation commits
- `dev`
  - only active working branch for V1 delivery
  - all ticket work is committed here first
  - all ticket work is pushed to `origin/dev`
- no feature branch should be created unless the user explicitly asks for it

## Ticket Rule

No repo change is allowed without a ticket.

That rule applies to:

- code
- docs
- workflows
- infra
- tests
- generated artifacts

If the needed work is not already covered by a ticket in [v1-implementation-tickets.md](../roadmaps/v1-implementation-tickets.md), add the ticket first before changing any other file.

The only allowed first edit without a prior ticket is adding the missing ticket itself.

## Section Rule

The default pull request boundary is one top-level ticket section from [v1-implementation-tickets.md](../roadmaps/v1-implementation-tickets.md).

The current sections are:

- `Backend Platform Tickets`
- `Customer Frontend Mobile Tickets`
- `Client Dashboard Tickets`
- `Admin Console Tickets`
- `LatteLink Web Tickets`
- `Additional Cross-Surface Tickets`

`V1 Critical Path` is planning context, not a delivery section.

Do not mix multiple sections into one PR unless the user explicitly approves that exception.

## Bootstrap Flow

Start each cycle from current `main`.

```bash
git switch main
git pull --ff-only origin main
git switch -C dev main
git push -u origin dev
```

If `dev` already exists and already points at the intended working tip, do not recreate it unnecessarily.

## Per-Ticket Execution Flow

For each ticket:

1. Confirm the ticket exists in [v1-implementation-tickets.md](../roadmaps/v1-implementation-tickets.md).
2. Update the ticket status before implementation if the status is stale.
3. Make only the changes required for that ticket.
4. Run the verification relevant to that ticket.
5. Update the ticket `done` and `blocked` notes so the ticket reflects reality.
6. Commit the ticket work on `dev`.
7. Push `dev` to `origin` immediately after the commit.

Do not batch unrelated tickets into one commit.

## Commit Rules

Every commit must include:

- a normal subject line
- a `Tickets:` section in the commit body
- a `Change log:` section in the commit body

Recommended commit template:

```text
<type>(<area>): <short summary>

Tickets:
- BE-V1-01
- BE-V1-02

Change log:
- describe the first concrete change
- describe the second concrete change
- describe any doc or workflow update included in the commit
```

`Verification:` may be added when useful, but `Tickets:` and `Change log:` are mandatory.

## Push Rules

After every ticket commit:

```bash
git push origin dev
```

Do not leave completed ticket commits only on the local `dev` branch.

## Pull Request Rules

After a section of tickets is complete on `dev`, open a pull request from `dev` to `main`.

Each PR must include:

- all relevant ticket IDs
- the section name
- a concise summary of the shipped work
- verification performed
- risk and rollback notes when applicable

Recommended PR body structure:

```text
## Section
- Backend Platform Tickets

## Tickets
- BE-V1-01
- BE-V1-02

## Change log
- summarize the completed ticket work
- summarize supporting workflow or doc changes

## Verification
- list the commands or checks that were run

## Risk and Rollback
- describe meaningful release risk and rollback path
```

Do not open a PR without listing every included ticket.

## Post-Merge Reset

After a `dev` to `main` PR merges:

1. update local `main` from `origin/main`
2. make sure local `dev` is aligned with the merged `main` state before starting the next section
3. push the aligned `dev` state back to `origin/dev` before starting the next ticket section

The exact alignment command can vary depending on whether `main` fast-forwarded cleanly or gained a merge commit, but the rule does not change:

- do not start the next section from a stale `dev`
- `dev` must be based on the current merged `main`

## Prohibited Flow

The following are not allowed unless the user explicitly approves an exception:

- direct implementation commits to `main`
- repo changes without a ticket
- commits without `Tickets:` and `Change log:`
- PRs without the included ticket IDs
- mixing unrelated ticket sections into one PR
- leaving completed ticket work unpushed on local `dev`
