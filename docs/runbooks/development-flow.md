# LatteLink Development Flow

Last reviewed: `2026-04-04`

This document is the single source of truth for how code moves through this repo. GitHub settings, branch protections, templates, and automation should stay aligned with this document. If another file disagrees with this one, this document wins.

---

## 1. Working Model

LatteLink uses a direct-to-`main` workflow.

- `main` is the only branch that matters remotely.
- Development happens locally on your machine.
- Optional local branches are allowed for convenience, but they are not required by policy and they do not need to exist on GitHub.
- The default shipping path is: make the change locally, validate it locally, commit it locally, then push directly to `origin/main`.

There is no required `dev` branch, no required feature branch naming convention, and no required pull request step.

---

## 2. Daily Flow

Use this as the normal path for routine work:

1. Sync your local checkout with `origin/main`.
2. Make the change locally.
3. Run the relevant local validation for the area you changed.
4. Commit with a clear message.
5. Push directly to `origin/main`.
6. Watch the `main` GitHub Actions runs and verify the live environment.

If a change is risky or you want review before deployment, you can still use a temporary branch and open a PR, but that is optional and no longer the default workflow.

---

## 3. Issues

GitHub issues are optional.

- Create an issue when it helps track larger work, bugs, follow-up items, or launch risks.
- Do not block code changes on issue creation.
- There is no required issue template, label set, or issue-before-code rule.

If you do use an issue, close it after the change is verified in the live environment or when the tracking work is otherwise complete.

---

## 4. Commits

There is no enforced commit-message format.

Preferred guidance:

- keep commit messages clear and specific
- make it obvious what changed and why
- avoid vague subjects such as `update`, `changes`, or `fix stuff`

Conventional commits are fine if they help, but they are optional.

---

## 5. Pull Requests

Pull requests are optional.

- Direct pushes to `main` are the normal path.
- Use a PR only when you want review, discussion, or a safer staging step for a larger change.
- The repo should not enforce PR-only delivery, PR templates, or PR metadata rules.

---

## 6. Deployment

Deployment is automatic from `main`.

Flow:

1. Push to `main`
2. GitHub Actions builds and publishes Docker images tagged with the full git SHA
3. GitHub Actions deploys that SHA to the live environment
4. Verify the deployed system

Manual redeploy and rollback should continue to use the deployment workflow `workflow_dispatch` path with a known git SHA.

---

## 7. Versioning

Versioning happens from `main`.

- Tag releases from verified `main` commits
- Update [CHANGELOG.md](/Users/yazan/Documents/Gazelle/Dev/GazelleMobilePlatform/CHANGELOG.md) when you want a formal release record
- Use semantic versioning when cutting tags

Typical release steps:

```bash
git checkout main
git pull
git tag v0.2.1
git push origin v0.2.1
```

---

## 8. Rollback

If a push to `main` is bad:

1. redeploy the previous known-good SHA with the deployment workflow
2. or revert the bad commit on `main` and push again
3. verify the live environment after rollback

---

## 9. AI Agent Rules

AI agents working in this repo should follow this operational guidance:

- start from the current `main` checkout unless there is a specific reason to use a temporary local branch
- do not require an issue or PR before making code changes
- push validated changes directly to `origin/main`
- if GitHub protection or repo automation blocks direct pushes to `main`, update or remove that enforcement so it matches this document
