# Notifications Push Tokens and Order-State Events

Last reviewed: `2026-03-10`

## Purpose

Validate local push-token registration and order-state notification dispatch behavior.

## Endpoints

- Gateway public endpoint:
  - `PUT /v1/devices/push-token`
- Notifications service internal endpoint:
  - `POST /v1/notifications/internal/order-state`

## Local Flow

1. Register a device push token to a user.
2. Trigger an order lifecycle event for the same user.
3. Confirm notifications service accepted and enqueued the event.

## Register Push Token Through Gateway

```bash
USER_ID="123e4567-e89b-12d3-a456-426614174950"

curl -s http://127.0.0.1:8080/v1/devices/push-token \
  -X PUT \
  -H "content-type: application/json" \
  -H "x-user-id: ${USER_ID}" \
  -d '{
    "deviceId": "ios-dev-01",
    "platform": "ios",
    "expoPushToken": "ExponentPushToken[local-dev-token]"
  }'
```

Expected response:

```json
{ "success": true }
```

## Emit Internal Order-State Event

```bash
curl -s http://127.0.0.1:3005/v1/notifications/internal/order-state \
  -X POST \
  -H "content-type: application/json" \
  -d "{
    \"userId\":\"${USER_ID}\",
    \"orderId\":\"123e4567-e89b-12d3-a456-426614174951\",
    \"status\":\"PAID\",
    \"pickupCode\":\"PICKUP1\",
    \"locationId\":\"flagship-01\",
    \"occurredAt\":\"2026-03-10T18:00:00.000Z\",
    \"note\":\"Payment accepted\"
  }"
```

Expected response shape:

```json
{ "accepted": true, "enqueued": 1, "deduplicated": false }
```

Repeat the same payload:
- expected `deduplicated: true`
- expected `enqueued: 0`

## Orders Integration

`services/orders` automatically emits internal order-state events when status changes to:
- `PENDING_PAYMENT`
- `PAID`
- `CANCELED`

The integration is best-effort and does not block order responses if notifications is unavailable.
