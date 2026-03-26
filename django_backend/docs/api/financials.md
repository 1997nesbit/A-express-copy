# Financials API

Base URL: `/api/`

All endpoints require authentication (HttpOnly cookie JWT).

---

## Accounts

### GET `/api/accounts/`
List all financial accounts.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "name": "Cash",
    "balance": "500000.00",
    "created_by": { "id": 1, "username": "ivan", "full_name": "Ivan Doe" },
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST `/api/accounts/`
Create a financial account. **Manager role required.**

**Request**
```json
{ "name": "M-Pesa Float" }
```

### PATCH `/api/accounts/{id}/`
Update account name.

### DELETE `/api/accounts/{id}/`
Delete an account. **Manager role required.**

---

## Payment Methods

### GET `/api/payment-methods/`
List all payment methods.

**Response `200 OK`**
```json
[
  { "id": 1, "name": "Cash", "is_user_selectable": true, "account": 1 },
  { "id": 2, "name": "M-Pesa", "is_user_selectable": true, "account": 2 }
]
```

### POST `/api/payment-methods/` / PATCH `/api/payment-methods/{id}/` / DELETE `/api/payment-methods/{id}/`
CRUD. **Manager role required.**

---

## Payment Categories

### GET `/api/payment-categories/`
```json
[
  { "id": 1, "name": "Service Fee" },
  { "id": 2, "name": "Spare Parts" }
]
```

### POST `/api/payment-categories/` / PATCH / DELETE
CRUD. **Manager role required.**

---

## Payments

### GET `/api/payments/`
List all payments (customer payments against tasks).

**Query Parameters**

| Param | Description |
|---|---|
| `task` | Filter by task ID |
| `method` | Filter by payment method ID |
| `category` | Filter by category ID |
| `date_after` / `date_before` | Date range filter |

**Response `200 OK`**
```json
[
  {
    "id": 10,
    "task": 42,
    "task_title": "Lenovo IdeaPad screen replacement",
    "task_status": "Ready for Pickup",
    "amount": "100000.00",
    "date": "2025-03-24",
    "method": 1,
    "method_name": "Cash",
    "description": "Customer Payment",
    "category": null,
    "category_name": null
  }
]
```

### POST `/api/payments/`
Record a payment against a task.

**Request**
```json
{
  "task": 42,
  "amount": "100000.00",
  "method": 1,
  "description": "Deposit",
  "category": null
}
```

**Notes:**
- `paid_amount` on the Task is updated automatically via signals
- `payment_status` on the Task is recalculated automatically
- Negative amounts represent refunds and may flip `payment_status` to `Refunded`

**Response `201 Created`** — full payment shape.

### PATCH `/api/payments/{id}/` / DELETE `/api/payments/{id}/`

---

## Cost Breakdowns

Items that adjust a task's total cost (additive, subtractive, or inclusive).

### GET `/api/cost-breakdowns/`
### POST `/api/cost-breakdowns/`

**Request**
```json
{
  "task": 42,
  "description": "Screen replacement part",
  "amount": "30000.00",
  "cost_type": "Additive",
  "category": "Spare Parts",
  "reason": "New screen sourced externally",
  "payment_method": 1
}
```

**Notes:**
- `Additive` → increases `total_cost`
- `Subtractive` → decreases `total_cost`
- `Inclusive` → already included in `estimated_cost`, display only

### PATCH `/api/cost-breakdowns/{id}/` / DELETE `/api/cost-breakdowns/{id}/`

---

## Transaction Requests (Expenditure / Revenue)

Approval workflow for non-task financial transactions.

### GET `/api/transaction-requests/`
List all requests.

**Query Parameters:** `status`, `transaction_type`, `requester`

**Response `200 OK`**
```json
[
  {
    "id": 5,
    "transaction_type": "Expenditure",
    "description": "Purchased thermal paste",
    "amount": "15000.00",
    "task": null,
    "task_title": null,
    "category": { "id": 2, "name": "Spare Parts" },
    "payment_method": { "id": 1, "name": "Cash" },
    "payment_method_name": "Cash",
    "status": "Pending",
    "cost_type": "Additive",
    "requester": { "id": 3, "username": "ali", "full_name": "Ali Hassan" },
    "requester_name": "Ali Hassan",
    "approver": null,
    "approver_name": null,
    "created_at": "2025-03-25T09:00:00Z",
    "updated_at": "2025-03-25T09:00:00Z"
  }
]
```

### POST `/api/transaction-requests/`
Create a transaction request (typically by Accountant or Front Desk).

**Request**
```json
{
  "transaction_type": "Expenditure",
  "description": "Purchased thermal paste",
  "amount": "15000.00",
  "task": null,
  "category_id": 2,
  "payment_method_id": 1,
  "cost_type": "Additive",
  "approver_id": null
}
```

> `approver_id` is optional. If omitted, a notification is broadcast to all Managers.

### POST `/api/transaction-requests/{id}/approve/`
Approve the request. **Manager role required.**

**Response `200 OK`**
```json
{ "detail": "Request approved. Payment/CostBreakdown created." }
```

### POST `/api/transaction-requests/{id}/reject/`
Reject the request. **Manager role required.**

**Request**
```json
{ "reason": "Amount too high, needs re-quote." }
```

---

## Debt Requests

Approval workflow for marking a task as debt.

### GET `/api/debt-requests/`

**Response `200 OK`**
```json
[
  {
    "id": 3,
    "task": 42,
    "task_title": "Lenovo IdeaPad screen replacement",
    "task_details": {
      "id": 42,
      "title": "Lenovo IdeaPad screen replacement",
      "customer_name": "Juma Ali",
      "outstanding_balance": "50000.00"
    },
    "status": "Pending",
    "requester": { "id": 1, "username": "ivan", "full_name": "Ivan Doe" },
    "requester_name": "Ivan Doe",
    "approver": null,
    "approver_name": null,
    "created_at": "2025-03-25T12:00:00Z",
    "updated_at": "2025-03-25T12:00:00Z"
  }
]
```

### POST `/api/debt-requests/`

**Request**
```json
{ "task": 42 }
```

### POST `/api/debt-requests/{id}/approve/`
Approve — sets `Task.is_debt = True`. **Manager role required.**

### POST `/api/debt-requests/{id}/reject/`
**Manager role required.**

---

## Unified Approval Requests (read-only)

Shows both `TransactionRequest` and `DebtRequest` in one list.

### GET `/api/unified-approval-requests/`

Returns items with a `request_type` field: `"transaction"` or `"debt"`.

---

## Financial Summary

### GET `/api/financial-summary/`
Aggregated revenue vs expenditure for a period.

**Query Parameters:** `period` (`today`, `week`, `month`, `year`, `custom`), `start_date`, `end_date`

**Response `200 OK`**
```json
{
  "revenue": [...],
  "expenditures": [...],
  "total_revenue": "3500000.00",
  "total_expenditures": "850000.00",
  "net_balance": "2650000.00",
  "opening_balance": "0.00",
  "date_range": "month",
  "period_start": "2025-03-01",
  "period_end": "2025-03-31"
}
```

---

## Accountant Dashboard Stats

### GET `/api/accountant-dashboard-stats/`

**Roles:** Accountant, Manager

**Response `200 OK`**
```json
{
  "pending_requests": 4,
  "total_collected_today": "650000.00",
  "outstanding_debt": "1200000.00",
  "account_balances": [
    { "name": "Cash", "balance": "500000.00" },
    { "name": "M-Pesa", "balance": "350000.00" }
  ]
}
```
