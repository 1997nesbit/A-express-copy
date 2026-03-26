# Messaging API

Base URL: `/api/messaging/`

All endpoints require authentication. SMS is sent via the **Briq API** (Tanzania).

---

## SMS Templates

### GET `/api/messaging/templates/`
List all SMS templates.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "name": "pickup_ready",
    "content": "Habari {customer_name}, kifaa chako cha {device_type} kwa jina {task_title} kiko tayari kuchukuliwa. Karibu {company_name}.",
    "is_active": true,
    "created_at": "2024-01-10T00:00:00Z"
  }
]
```

> Template variables like `{customer_name}`, `{task_title}`, `{company_name}` etc. are automatically filled at send time.

### POST `/api/messaging/templates/`

**Request**
```json
{
  "name": "debt_final_notice",
  "content": "Habari {customer_name}, tafadhali lipa deni lako la TSH {outstanding_balance} haraka iwezekanavyo.",
  "is_active": true
}
```

### PATCH `/api/messaging/templates/{id}/`
### DELETE `/api/messaging/templates/{id}/`

---

## Message History (Logs)

### GET `/api/messaging/history/`
List all sent messages.

**Query Parameters**

| Param | Description |
|---|---|
| `task` | Filter by task ID |
| `status` | `sent`, `failed`, `pending` |
| `ordering` | e.g. `-sent_at` |

**Response `200 OK`**
```json
[
  {
    "id": 55,
    "task": 42,
    "recipient_phone": "+255712000000",
    "message_content": "Habari Juma Ali, kifaa chako kiko tayari...",
    "status": "sent",
    "sent_by": { "id": 1, "username": "ivan", "full_name": "Ivan Doe" },
    "sent_at": "2025-03-25T11:30:00Z",
    "response_data": { "message_id": "briq-abc123", "status": "accepted" }
  }
]
```

---

## Sending SMS

### POST `/api/messaging/tasks/{task_id}/send-sms/`
Send a manual SMS to the customer of a specific task.

**Request**
```json
{
  "message": "Habari Juma Ali, kifaa chako kiko tayari kuchukuliwa."
}
```

**Response `200 OK`**
```json
{
  "detail": "SMS sent successfully.",
  "message_log_id": 55
}
```

**Error `400 Bad Request`** — customer has no phone number, or Briq API error.
```json
{ "detail": "Customer has no phone number on file." }
```

---

### POST `/api/messaging/tasks/{task_id}/send-debt-reminder/`
Send a debt reminder SMS for a specific task.

**Response `200 OK`**
```json
{ "detail": "Debt reminder sent to +255712000000." }
```

---

### POST `/api/messaging/tasks/{task_id}/preview-message/`
Preview what a template message will look like for a task (no SMS sent).

**Request**
```json
{ "template_id": 1 }
```

**Response `200 OK`**
```json
{
  "preview": "Habari Juma Ali, kifaa chako cha Lenovo IdeaPad 3 kiko tayari kuchukuliwa. Karibu A-Express Technologies."
}
```

---

### POST `/api/messaging/bulk-send/`
Send the same SMS to multiple tasks' customers at once.

**Request**
```json
{
  "task_ids": [42, 43, 50],
  "message": "Tafadhali kumbuka kuchukua kifaa chako."
}
```

**Response `200 OK`**
```json
{
  "sent": 3,
  "failed": 0,
  "results": [
    { "task_id": 42, "status": "sent" },
    { "task_id": 43, "status": "sent" },
    { "task_id": 50, "status": "sent" }
  ]
}
```

---

## Scheduler Notifications

These are records of automated background jobs (pickup/debt reminders) for display in the UI.

### GET `/api/messaging/scheduler-notifications/`
List unacknowledged scheduler job results.

**Response `200 OK`**
```json
[
  {
    "id": 12,
    "job_type": "pickup_reminder",
    "tasks_found": 8,
    "messages_sent": 7,
    "messages_failed": 1,
    "failure_details": [
      { "task_id": 50, "task_title": "HP Pavilion repair", "error": "No phone number" }
    ],
    "created_at": "2025-03-25T08:00:00Z"
  }
]
```

### POST `/api/messaging/scheduler-notifications/{id}/acknowledge/`
Mark a scheduler notification as seen by the current user.

**Response `200 OK`**
```json
{ "detail": "Notification acknowledged." }
```
