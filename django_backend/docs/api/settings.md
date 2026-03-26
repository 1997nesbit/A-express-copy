# System Settings API

Base URL: `/api/system-settings/`

The `SystemSettings` model is a **singleton** — only one instance exists in the database. All GET requests return the same object; all PATCH requests update it in place.

All endpoints require authentication. **Manager role required** for updates.

---

## GET `/api/system-settings/`
Retrieve the current system settings.

**Response `200 OK`**
```json
{
  "id": 1,
  "company_name": "A PLUS EXPRESS TECHNOLOGIES LTD",
  "company_phone_numbers": ["+255712000000", "+255768000001"],
  "auto_sms_on_task_creation": true,
  "auto_sms_on_ready_for_pickup": true,
  "auto_sms_on_picked_up": true,
  "auto_pickup_reminders_enabled": false,
  "pickup_reminder_hours": 24,
  "auto_debt_reminders_enabled": false,
  "debt_reminder_hours": 72,
  "debt_reminder_max_days": 30,
  "storage_fee_per_day": 3000,
  "pickup_deadline_days": 7,
  "updated_at": "2025-03-25T10:00:00Z"
}
```

---

## PATCH `/api/system-settings/`
Update one or more settings. All fields are optional.

**Roles:** Manager only

**Request** (any subset)
```json
{
  "auto_pickup_reminders_enabled": true,
  "pickup_reminder_hours": 48,
  "storage_fee_per_day": 5000,
  "company_phone_numbers": ["+255712000000"]
}
```

**Response `200 OK`** — full settings object.

---

## Field Reference

| Field | Type | Default | Description |
|---|---|---|---|
| `company_name` | string | `"A PLUS EXPRESS TECHNOLOGIES LTD"` | Used in SMS messages |
| `company_phone_numbers` | array of strings | `[]` | Company contact numbers shown in SMS |
| `auto_sms_on_task_creation` | boolean | `true` | Auto-SMS customer on new task |
| `auto_sms_on_ready_for_pickup` | boolean | `true` | Auto-SMS when task approved for pickup |
| `auto_sms_on_picked_up` | boolean | `true` | Auto-SMS thank you/debt reminder after pickup |
| `auto_pickup_reminders_enabled` | boolean | `false` | Enable scheduled pickup reminder SMS job |
| `pickup_reminder_hours` | integer | `24` | Hours between pickup reminder messages |
| `auto_debt_reminders_enabled` | boolean | `false` | Enable scheduled debt reminder SMS job |
| `debt_reminder_hours` | integer | `72` | Hours between debt reminder messages |
| `debt_reminder_max_days` | integer | `30` | Stop reminders after N days from pickup |
| `storage_fee_per_day` | integer | `3000` | Daily storage fee (TSH), used in SMS templates |
| `pickup_deadline_days` | integer | `7` | Days customers have to pick up, used in SMS templates |
