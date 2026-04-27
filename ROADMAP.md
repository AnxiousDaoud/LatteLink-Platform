# Roadmap

Last updated: 2026-04-27  
Basis: code audit + product vision  
See PRODUCT_STAGE.md for current classification and ARCHITECTURE.md for system map.

## Vision

LatteLink begins as a branded mobile ordering platform for independent coffee shops. The long-term goal is to become a **Growth OS**: a platform that helps merchants own customer relationships, understand order patterns, identify revenue opportunities, and run targeted campaigns that drive repeat business.

## Current State Summary

- One active merchant (`rawaqcoffee01`) in a pre-production state
- Full ordering, payment, and loyalty flow implemented
- Merchant dashboard functional for orders, menu, store config, team
- Internal admin console for merchant onboarding
- Single-host Docker Compose deployment
- Three blocking issues before any live pilot: fulfillment mode, loyalty scoping, stale payment reconciliation

---

## Phase 0 — Stabilize MVP
**Target**: 2–3 weeks  
**Goal**: Make the existing system reliable enough for a real merchant pilot.

### Scope
- Set `staff` fulfillment mode as the documented default for all real deployments (not `time_based`)
- Validate and harden the existing R2 media upload pipeline in a deployed environment
- Remove unconditional order-stream polling when event-bus SSE subscription succeeds
- Add structured JSON logging with request IDs to gateway and orders service
- Fix customer session absolute TTL (currently idle-timeout only)
- Remove fallback hardcoded menu/config data from mobile `catalog.ts`

### Success metrics
- End-to-end checkout demo passes QA with no time-based auto-progression
- Operator can upload a menu image from the dashboard in staging with real R2 credentials
- Order status updates arrive in <2s via event bus without parallel steady-state polling
- All critical paths produce structured logs

### Not in scope
- New features, new services, new merchants, infrastructure changes

---

## Phase 1 — Merchant Onboarding and Direct Ordering
**Target**: 4–6 weeks after Phase 0  
**Goal**: Onboard 1–5 real paying merchants and process real orders.

### Scope
- Fix loyalty `location_id` scoping (migration required before second merchant)
- Create `merchant_customer_profiles` table (foundation for future analytics)
- Per-merchant EAS build profiles documented and validated
- Stripe Connect payment webhook hardening (full lifecycle handlers)
- Launch readiness checklist in admin console
- Backup and restore procedure with tested DR drill
- Operator email uniqueness audit (globally unique email is a multi-tenant bug)

### New schema
- `loyalty_balances`: add `location_id`, change PK to `(user_id, location_id)`
- `loyalty_ledger_entries`: add `location_id`
- `merchant_customer_profiles (user_id, location_id, first_order_at, last_order_at, order_count, lifetime_cents)`

### Success metrics
- 2+ merchants processing real orders
- Zero loyalty cross-contamination
- Stripe payments reconciling correctly
- Merchants onboarded via admin console in <1 hour

---

## Phase 2 — Customer Data Foundation
**Target**: 6–8 weeks after Phase 1  
**Goal**: Capture behavioral data needed for future growth tools.

### Scope
- Behavioral events table: `order_placed`, `order_paid`, `order_canceled`, `loyalty_earned`, `loyalty_redeemed`
- Populate `merchant_customer_profiles` automatically on every order completion
- Basic KPI endpoint: orders today, revenue today, top 5 items
- Client dashboard analytics summary card
- Passkey mobile auth UI (server already ready)
- Basic observability: log aggregation (e.g., Loki or Datadog) and error tracking (Sentry)

### New schema
- `behavioral_events (event_id, user_id, location_id, event_type, event_data JSONB, occurred_at)`

### Success metrics
- `merchant_customer_profiles` populating on every order
- `behavioral_events` capturing lifecycle events
- KPI dashboard showing real numbers
- Error rate visible in Sentry within 1 hour of any failure

---

## Phase 3 — Loyalty and Basic Campaigns
**Target**: 8–10 weeks after Phase 2  
**Goal**: Let merchants drive repeat purchases manually.

### Scope
- Merchant-configurable loyalty programs (points-per-dollar, cents-per-point, max redemption)
- Promo codes (percent or fixed discount, per-location)
- Manual push campaigns: write message, target segment (e.g., "all customers who ordered last 30 days"), send
- Push notification receipt polling (required before campaigns — confirm delivery)

### New schema
- `loyalty_programs (location_id, points_per_dollar, cents_per_point, max_redeemable_percent)`
- `promo_codes (code, location_id, type, value, min_order_cents, max_uses, uses, expires_at, active)`
- `campaigns (campaign_id, location_id, name, message, channel, target_segment_json, status, sent_at)`
- `campaign_sends (send_id, campaign_id, user_id, sent_at, delivered_at)`

### Success metrics
- Merchants can create and send a campaign
- Redemption rate measurable via `campaign_sends`
- Loyalty program configured independently per merchant

---

## Phase 4 — Analytics and Attribution
**Target**: 8–10 weeks after Phase 3  
**Goal**: Show merchants what is working and where revenue opportunities are.

### Scope
- Analytics dashboard: revenue trends, customer retention, item performance
- Customer segments: new / loyal / lapsed / high-LTV
- Campaign attribution: did a campaign recipient order within N days?
- Materialized KPI summaries (hourly refresh) to avoid OLAP on transactional DB
- CSV export of customer segment

### New schema
- `campaign_outcomes (campaign_id, user_id, order_id, attributed_at)` — attribution table
- Materialized summary tables for merchant analytics

### Success metrics
- Merchants open analytics tab weekly
- At least one merchant adjusts strategy based on data
- Campaign attribution shows measurable lift

---

## Phase 5 — Automation and AI-assisted Growth OS
**Target**: 12+ weeks after Phase 4  
**Goal**: Recommend and eventually automate growth actions.

### Scope
- Event-triggered campaign engine: define conditions → auto-send
- AI-generated campaign copy suggestions (Claude API)
- Merchant "Growth Score" weekly digest
- POS integration research

### Prerequisites
- 3+ months of behavioral event data from real merchants
- Campaign delivery reliability proven in Phase 3
- Merchant opt-in consent mechanisms in place

---

## Phase 6 — Scale and Platform Hardening
**Target**: Ongoing after Phase 2  
**Goal**: Support many merchants reliably.

### Scope
- Move from single-host Docker Compose to managed containers (Fly.io / Railway / AWS ECS)
- Postgres connection pooling (PgBouncer)
- SaaS billing: per-merchant subscription via Stripe Billing
- RBAC: owner / manager / store-staff with per-role capability scoping
- Formal support tooling: audit log, order lookup by phone/email
- Multi-region read replicas for analytics

### Not in scope until >20 merchants
- Service mesh
- Custom Kubernetes setup
- Multi-region writes

---

## What Not To Build Yet

- Email campaigns (no provider, no templates, no compliance infra)
- SMS (TCPA complexity, high cost)
- POS integration (wait for merchant demand signal)
- Web ordering app (mobile is primary; add complexity only when justified)
- Multi-region deployment (single host is fine for <20 merchants)
- Kubernetes (Docker Compose → managed containers first)
- New microservices (extend existing service boundaries)
- A/B testing framework (premature without campaign volume)
- AI recommendations (need 3+ months of real data first)
