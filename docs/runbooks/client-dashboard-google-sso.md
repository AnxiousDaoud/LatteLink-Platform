# Client Dashboard Google SSO Setup

Last reviewed: `2026-04-01`

## Goal

Enable Google sign-in for already-provisioned client dashboard accounts.

## Product Rules

- Google only proves identity.
- Store, role, and capabilities still come from the platform database.
- First-time Google sign-in must map to an existing active dashboard account.
- If no active dashboard account exists for the verified email, access is denied.

Provision the owner account first with:

- [client-dashboard-owner-provisioning.md](/Users/yazan/Documents/Gazelle/Dev/GazelleMobilePlatform/docs/runbooks/client-dashboard-owner-provisioning.md)

## Required Google Console Setup

Create a Google OAuth web application and capture:

- client ID
- client secret
- authorized redirect URI for the dashboard callback

Recommended redirect URI pattern:

- `https://<client-dashboard-domain>/?google_auth_callback=1`

## Required Runtime Environment

Set these on the identity service host:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_STATE_SECRET`
- `GOOGLE_OAUTH_ALLOWED_REDIRECT_URIS`

Example:

```env
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_STATE_SECRET=replace-with-long-random-secret
GOOGLE_OAUTH_ALLOWED_REDIRECT_URIS=https://client.example.com/?google_auth_callback=1
```

## Request Flow

1. The browser calls `GET /v1/operator/auth/google/start?redirectUri=...`.
2. Identity signs and returns the Google authorization URL.
3. Google redirects back to the client dashboard with `code` and `state`.
4. The browser calls `POST /v1/operator/auth/google/exchange`.
5. Identity exchanges the code, reads Google user info, and resolves the store account.
6. If the Google user is already linked or matches an active provisioned account by verified email, a normal dashboard session is issued.

## First-Time Sign-In Policy

V1 policy:

- do not auto-provision dashboard accounts from Google
- owner-created accounts are the source of truth
- verified Google email may link to an existing active account on first sign-in

This keeps store, role, and permission assignment under platform control.

## V1 Limitations

- Apple SSO is deferred
- Google sign-in depends on verified email matching for first-time link
- multi-store account selection is deferred until multi-location support exists
