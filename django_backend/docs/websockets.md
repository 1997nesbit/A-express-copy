# WebSocket API

The backend uses **Django Channels** with a Redis channel layer for real-time push notifications.

---

## Connection

### URL
```
ws://localhost:8000/ws/notifications/
```

Production:
```
wss://your-railway-domain.railway.app/ws/notifications/
```

### Authentication
WebSocket connections are authenticated via the **`access_token` HttpOnly cookie**. The cookie is read by `notifications/middleware.py` before the consumer is instantiated.

**Unauthenticated connections are immediately closed.**

---

## Channel Groups

Users are added to two groups at connect time:

| Group | Name Pattern | Who's in it |
|---|---|---|
| Role group | `notifications_manager` | All Managers |
| Role group | `notifications_front_desk` | All Front Desk users |
| Role group | `notifications_technician` | All Technicians |
| Role group | `notifications_accountant` | All Accountants |
| User group | `user_{id}` | A specific user by their DB ID |

Role names are **lowercased** and **spaces replaced with underscores** (e.g. `Front Desk` → `notifications_front_desk`).

---

## Inbound Messages (Client → Server)

Only one message type is handled from the client:

### `ping`
Keepalive heartbeat.

```json
{ "type": "ping" }
```

**Server response:**
```json
{ "type": "pong" }
```

---

## Outbound Events (Server → Client)

All events are JSON objects sent by the server. The `type` field identifies the event.

### `connection_established`
Sent immediately on successful connection.

```json
{
  "type": "connection_established",
  "message": "Connected to notifications as Manager"
}
```

---

### `task_notification`
A new task-related event (e.g. new task created, status changed).

```json
{
  "type": "task_notification",
  "task_id": 42,
  "title": "HP Pavilion keyboard repair",
  "event": "task_created",
  "message": "New task created by Sara Mbeki"
}
```

---

### `task_status_update`
Broadcast when a task's status changes. Used to update live task lists in the UI.

```json
{
  "type": "task_status_update",
  "task_id": 42,
  "new_status": "Ready for Pickup",
  "previous_status": "Completed",
  "updated_by": "Ivan Doe"
}
```

---

### `toast_notification`
A UI toast popup message (info, success, warning, error).

```json
{
  "type": "toast_notification",
  "toast_type": "success",
  "title": "Request Approved",
  "message": "Transaction request #5 has been approved."
}
```

---

### `data_update`
Generic real-time update for payments, customers, or accounts — triggers a frontend data refetch.

```json
{
  "type": "data_update",
  "resource": "payment",
  "action": "created",
  "task_id": 42
}
```

---

### `scheduler_notification`
Result of an automated background job (pickup/debt reminders).

```json
{
  "type": "scheduler_notification",
  "job_type": "pickup_reminder",
  "tasks_found": 8,
  "messages_sent": 7,
  "messages_failed": 1,
  "notification_id": 12
}
```

---

## Broadcasting from Django Views

To send a WebSocket event from a Django view or signal, use the channel layer:

```python
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

# Send to all managers
async_to_sync(channel_layer.group_send)(
    "notifications_manager",
    {
        "type": "toast.notification",   # maps to consumer handler: toast_notification()
        "data": {
            "type": "toast_notification",
            "toast_type": "info",
            "title": "New Request",
            "message": "A new expenditure request is awaiting approval."
        }
    }
)

# Send to a specific user
async_to_sync(channel_layer.group_send)(
    f"user_{user.id}",
    {
        "type": "task.notification",
        "data": {
            "type": "task_notification",
            "task_id": 42,
            "event": "assigned",
            "message": "You have been assigned a new task."
        }
    }
)
```

> Note: Django Channels event `type` uses **dots** (`toast.notification`), which map to consumer methods with **underscores** (`toast_notification`).
