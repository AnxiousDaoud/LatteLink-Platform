# GitHub Setup Checklist

## Repository
- org: `GazelleDev`
- repo: `GazelleMobilePlatform`
- visibility: `public`
- default branch: `main`
- merge method: squash only

## Teams
Create:
- `@GazelleDev/mobile`
- `@GazelleDev/platform`
- `@GazelleDev/infra`
- `@GazelleDev/security`

## Branch Protection (`main`)
Enable:
- pull request required
- minimum 1 approval
- CODEOWNERS review required
- dismiss stale approvals
- require conversation resolution
- require linear history
- require signed commits
- block force pushes
- block deletion

Required checks:
- `ci / lint`
- `ci / typecheck`
- `ci / unit-tests`
- `ci / contract-tests`
- `ci / build`
- `ci / terraform-validate`
- `security / codeql`
- `security / dependency-review`
- `security / secret-scan`

## Environments
Create environments:
- `dev`
- `staging`
- `prod`

Rules:
- `dev`: auto deploy from `main`
- `staging`: manual approval
- `prod`: manual approval with reviewers `@GazelleDev/platform`, `@GazelleDev/infra`

## Project Board
Create project board columns:
- Backlog
- Ready
- In Progress
- Review
- Done

## Repository Variables
- `AWS_REGION=us-east-1`
- `API_BASE_URL_DEV`
- `API_BASE_URL_STAGING`
- `API_BASE_URL_PROD`

## Environment Secrets
- `AWS_ROLE_ARN`
- `DATABASE_URL`
- `REDIS_URL`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_SERVICE_ID`
- `APPLE_MERCHANT_ID`
- `CLOVER_API_KEY`
- `CLOVER_MERCHANT_ID`
- `SES_FROM_EMAIL`
- `EXPO_TOKEN`
- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`
