# Release Runbook

The authoritative release and deployment workflow for this repo lives in [development-flow.md](/Users/yazan/Documents/Gazelle/Dev/GazelleMobilePlatform/docs/runbooks/development-flow.md).

Current release flow:

1. Validate the release candidate locally.
2. Push the intended commit directly to `main`.
3. Let the `main` push publish full-SHA images and deploy automatically.
4. Verify the live environment.
5. Tag the release on `main` if you want a formal version marker.
6. Update [CHANGELOG.md](/Users/yazan/Documents/Gazelle/Dev/GazelleMobilePlatform/CHANGELOG.md) when needed.

Rollback uses the deployment workflow `workflow_dispatch` path with a previous full git SHA.

If this file ever conflicts with [development-flow.md](/Users/yazan/Documents/Gazelle/Dev/GazelleMobilePlatform/docs/runbooks/development-flow.md), [development-flow.md](/Users/yazan/Documents/Gazelle/Dev/GazelleMobilePlatform/docs/runbooks/development-flow.md) wins.
