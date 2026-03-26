# Tasks API (Eapp)

Base URL: `/api/`

All endpoints require authentication (HttpOnly cookie JWT).

---

## Task Status Flow

```
Pending → In Progress → Completed → Ready for Pickup → Picked Up
                    ↓
              Awaiting Parts
                    ↓
              (back to In Progress)
```

Workshop sub-flow:
```
Any status → [workshop_status: In Workshop] → [Solved / Not Solved] → back to technician
```

---

## Endpoints

### GET `/api/tasks/`
List tasks. Results depend on the caller's role:
- **Manager/Front Desk**: all tasks
- **Technician**: only tasks assigned to them (or their location)
- **Accountant**: all tasks

Supports filtering, ordering, and search.

**Query Parameters**

| Param | Description |
|---|---|
| `status` | Filter by status, e.g. `Pending` |
| `payment_status` | Filter by payment status |
| `urgency` | Filter by urgency |
| `assigned_to` | Filter by technician user ID |
| `current_location` | Filter by location ID |
| `is_debt` | `true` / `false` |
| `is_terminated` | `true` / `false` |
| `search` | Search by task title or customer name |
| `ordering` | e.g. `-created_at`, `urgency` |
| `page` / `page_size` | Pagination |

**Response `200 OK`**
```json
{
  "count": 120,
  "next": "http://localhost:8000/api/tasks/?page=2",
  "previous": null,
  "results": [
    {
      "id": 42,
      "title": "Lenovo IdeaPad screen replacement",
      "status": "In Progress",
      "urgency": "Ina Haraka",
      "payment_status": "Unpaid",
      "workshop_status": null,
      "current_location": 1,
      "current_location_details": { "id": 1, "name": "Main Branch", "is_workshop": false, "is_active": true },
      "brand_details": { "id": 3, "name": "Lenovo" },
      "laptop_model": 5,
      "laptop_model_details": { "id": 5, "name": "IdeaPad 3" },
      "description": "Customer says screen flickers",
      "updated_at": "2025-03-25T10:30:00Z",
      "customer_details": { "name": "Juma Ali" },
      "assigned_to_details": { "full_name": "Hassan Mwangi" },
      "outstanding_balance": "150000.00",
      "total_cost": "150000.00",
      "is_debt": false,
      "is_terminated": false,
      "to_be_checked": false
    }
  ]
}
```

---

### POST `/api/tasks/`
Create a new task (repair job intake).

**Roles:** Front Desk, Manager

**Request**
```json
{
  "title": "HP Pavilion keyboard repair",
  "description": "Several keys not responding",
  "customer": 7,
  "brand": 2,
  "laptop_model": 9,
  "device_type": "Full",
  "device_notes": "",
  "urgency": "Yupo",
  "current_location": 1,
  "assigned_to": 4,
  "estimated_cost": 50000,
  "is_referred": false,
  "referred_by": null
}
```

**Notes:**
- `device_notes` is **required** when `device_type` is `Not Full` or `Motherboard Only`
- `total_cost` is automatically set to `estimated_cost` on creation
- Auto-SMS is sent to the customer if `auto_sms_on_task_creation` is enabled in SystemSettings

**Response `201 Created`** — returns full `TaskDetailSerializer` shape (see GET `/api/tasks/{id}/`).

---

### GET `/api/tasks/{id}/`
Retrieve full task detail with all nested objects.

**Response `200 OK`**
```json
{
  "id": 42,
  "title": "Lenovo IdeaPad screen replacement",
  "description": "Customer says screen flickers",
  "status": "In Progress",
  "urgency": "Ina Haraka",
  "assigned_to": 4,
  "assigned_to_details": {
    "id": 4, "username": "hassan", "full_name": "Hassan Mwangi", "role": "Technician",
    "profile_picture_url": null
  },
  "created_by_details": { "id": 1, "username": "ivan", "full_name": "Ivan Doe" },
  "created_at": "2025-03-20T09:00:00Z",
  "updated_at": "2025-03-25T10:30:00Z",
  "customer": 7,
  "customer_details": {
    "id": 7,
    "name": "Juma Ali",
    "customer_type": "Normal",
    "phone_numbers": [{ "id": 3, "phone_number": "+255712000000" }]
  },
  "brand": 3,
  "brand_details": { "id": 3, "name": "Lenovo" },
  "laptop_model": 5,
  "laptop_model_details": { "id": 5, "name": "IdeaPad 3" },
  "device_type": "Full",
  "device_notes": "",
  "estimated_cost": "150000.00",
  "total_cost": "150000.00",
  "paid_amount": "0.00",
  "outstanding_balance": "150000.00",
  "payment_status": "Unpaid",
  "current_location": 1,
  "current_location_details": { "id": 1, "name": "Main Branch", "is_workshop": false },
  "current_location_name": "Main Branch",
  "date_in": "2025-03-20",
  "approved_at": null,
  "approved_by": null,
  "date_out": null,
  "is_referred": false,
  "is_debt": false,
  "is_terminated": false,
  "referred_by": null,
  "workshop_status": null,
  "workshop_location": null,
  "to_be_checked": false,
  "cost_breakdowns": [],
  "payments": [],
  "activities": [
    {
      "id": 101,
      "user": { "id": 1, "username": "ivan", "full_name": "Ivan Doe" },
      "timestamp": "2025-03-20T09:00:00Z",
      "type": "intake",
      "message": "Task created",
      "details": null
    }
  ]
}
```

---

### PATCH `/api/tasks/{id}/`
Partially update a task (status changes, assignment, cost, etc.).

**Request** (any subset of writable fields)
```json
{
  "status": "Completed",
  "assigned_to": 5,
  "estimated_cost": "180000.00"
}
```

**Notes:**
- Changing `status` to `Ready for Pickup` triggers an auto-SMS if enabled
- Changing `status` to `Picked Up` triggers a pickup/debt auto-SMS if enabled
- Changing `assigned_to` records a `TaskActivity` of type `assignment`

**Response `200 OK`** — full task detail shape.

---

### DELETE `/api/tasks/{id}/`
Delete a task. **Manager role required.**

**Response `204 No Content`**

---

### GET `/api/dashboard-stats/`
Aggregated task statistics for the main dashboard.

**Response `200 OK`**
```json
{
  "total_tasks": 350,
  "pending": 40,
  "in_progress": 85,
  "awaiting_parts": 12,
  "completed": 60,
  "ready_for_pickup": 30,
  "picked_up": 123,
  "total_revenue": "12500000.00",
  "outstanding_debt": "800000.00"
}
```
