# Reports API

Base URL: `/api/`

All endpoints require authentication. Most are restricted to **Manager** or **Accountant** roles.

---

## Predefined Reports

### GET `/api/revenue-overview/`
Revenue breakdown by period.

**Query Parameters:** `period` (`today`, `week`, `month`, `year`, `custom`), `start_date`, `end_date`

**Response `200 OK`**
```json
{
  "period": "month",
  "period_start": "2025-03-01",
  "period_end": "2025-03-31",
  "total_revenue": "8500000.00",
  "by_payment_method": [
    { "method": "Cash", "total": "5000000.00" },
    { "method": "M-Pesa", "total": "3500000.00" }
  ],
  "daily_breakdown": [
    { "date": "2025-03-01", "revenue": "320000.00" }
  ]
}
```

---

### GET `/api/reports/outstanding-payments/`
Tasks with unpaid or partially paid balances.

**Response `200 OK`**
```json
[
  {
    "id": 42,
    "title": "Lenovo IdeaPad screen replacement",
    "customer_name": "Juma Ali",
    "total_cost": "150000.00",
    "paid_amount": "100000.00",
    "outstanding_balance": "50000.00",
    "payment_status": "Partially Paid",
    "date_in": "2025-03-20",
    "is_debt": false
  }
]
```

---

### GET `/api/reports/task-status/`
Count of tasks grouped by status.

**Response `200 OK`**
```json
{
  "Pending": 40,
  "In Progress": 85,
  "Awaiting Parts": 12,
  "Completed": 60,
  "Ready for Pickup": 30,
  "Picked Up": 130
}
```

---

### GET `/api/reports/technician-performance/`
Per-technician completions and revenue for a period.

**Query Parameters:** `period`, `start_date`, `end_date`

**Response `200 OK`**
```json
[
  {
    "technician_id": 4,
    "technician_name": "Hassan Mwangi",
    "tasks_completed": 28,
    "total_revenue": "2800000.00",
    "avg_completion_hours": 18.4
  }
]
```

---

### GET `/api/reports/technician-workload/`
Current active task counts per technician.

**Response `200 OK`**
```json
[
  {
    "technician_id": 4,
    "technician_name": "Hassan Mwangi",
    "active_tasks": 7,
    "pending_tasks": 2,
    "in_progress_tasks": 5
  }
]
```

---

### GET `/api/reports/task-execution/`
Task execution time metrics (assignment → completion).

**Query Parameters:** `period`, `start_date`, `end_date`

**Response `200 OK`**
```json
[
  {
    "task_id": 42,
    "title": "Lenovo IdeaPad screen replacement",
    "technician": "Hassan Mwangi",
    "first_assigned_at": "2025-03-20T10:00:00Z",
    "completed_at": "2025-03-22T14:00:00Z",
    "net_execution_hours": 48.0,
    "return_count": 0
  }
]
```

---

### GET `/api/reports/payment-methods/`
Revenue breakdown by payment method.

**Query Parameters:** `period`, `start_date`, `end_date`

**Response `200 OK`**
```json
[
  { "method": "Cash", "total": "5000000.00", "count": 80 },
  { "method": "M-Pesa", "total": "3500000.00", "count": 55 }
]
```

---

### GET `/api/reports/front-desk-performance/`
Tasks created per Front Desk user for a period.

**Response `200 OK`**
```json
[
  {
    "user_id": 2,
    "username": "sara",
    "full_name": "Sara Mbeki",
    "tasks_created": 45,
    "total_revenue": "4500000.00"
  }
]
```

---

### GET `/api/reports/dashboard-data/`
Aggregated high-level stats for the reports dashboard.

**Response `200 OK`**
```json
{
  "total_tasks_this_month": 120,
  "completed_this_month": 85,
  "total_revenue_this_month": "8500000.00",
  "outstanding_debt": "1200000.00",
  "top_technician": "Hassan Mwangi",
  "busiest_day": "2025-03-18"
}
```

---

### GET `/api/reports/print-tasks/`
Printable task list (all active tasks with customer and technician info).

**Query Parameters:** `location`, `status`, `assigned_to`

**Response `200 OK`** — array of task list items suitable for printing.

---

## Custom Report Generator

### GET `/api/reports/field-options/`
Returns the available fields and filters for building a custom report.

**Response `200 OK`**
```json
{
  "fields": ["id", "title", "status", "urgency", "total_cost", "paid_amount", "outstanding_balance", "date_in", "customer_name", "technician_name"],
  "types": ["Task", "Payment"],
  "date_ranges": ["today", "week", "month", "year", "custom"]
}
```

---

### POST `/api/reports/generate/`
Generate a custom report based on selected fields and filters.

**Request**
```json
{
  "reportName": "March Completed Tasks",
  "selectedType": "Task",
  "selectedFields": ["id", "title", "status", "total_cost", "technician_name"],
  "dateRange": "custom",
  "customStartDate": "2025-03-01",
  "customEndDate": "2025-03-31"
}
```

**Response `200 OK`**
```json
{
  "report_name": "March Completed Tasks",
  "generated_at": "2025-03-25T12:00:00Z",
  "columns": ["id", "title", "status", "total_cost", "technician_name"],
  "rows": [
    [42, "Lenovo IdeaPad screen replacement", "Picked Up", "150000.00", "Hassan Mwangi"]
  ],
  "total_rows": 85
}
```
