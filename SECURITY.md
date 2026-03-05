# Security Policy

## Supported Versions

Security patches apply to `main` and active release tags.

## Reporting a Vulnerability

Email: `security@gazellecoffee.com`

Please include:

- impact summary
- proof of concept
- affected scope
- recommended remediation

## Secret Handling

- `.env` files are not committed.
- Secrets are stored in GitHub Environments and AWS Secrets Manager.
- Public repository configuration must remain non-sensitive.
