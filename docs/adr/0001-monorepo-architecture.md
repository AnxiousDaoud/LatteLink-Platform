# ADR 0001: Monorepo Architecture

## Status
Accepted

## Context
The platform includes mobile app, gateway, microservices, shared contracts, and infrastructure. Tight contract consistency and coordinated releases are required.

## Decision
Use a single public monorepo with pnpm workspaces + Turborepo and shared contracts.

## Consequences
- Positive: faster cross-service changes, consistent contracts, unified CI/CD.
- Tradeoff: repository scale requires strict governance and CI discipline.
