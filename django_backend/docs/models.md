# Models Reference

Quick reference for all models, their fields, and relationships.

---

## `users` app

### User
Custom user model extending `AbstractBaseUser`.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `username` | CharField(50) | unique |
| `email` | EmailField(100) | unique |
| `first_name` | CharField(50) | |
| `last_name` | CharField(50) | |
| `phone` | CharField(20) | nullable |
| `role` | CharField choices | `Manager`, `Front Desk`, `Technician`, `Accountant` |
| `is_workshop` | BooleanField | Technician is workshop-based |
| `is_active` | BooleanField | default True |
| `is_staff` | BooleanField | Django admin access |
| `profile_picture` | ImageField | stored in Cloudinary or local `media/` |
| `created_at` | DateTimeField | |
| `last_login` | DateTimeField | nullable |

### Session
Tracks active JWT sessions per user for session management.

| Field | Type | Notes |
|---|---|---|
| `id` | UUIDField (PK) | |
| `user` | FK → User | CASCADE |
| `jti` | CharField(255) | JWT ID claim |
| `refresh_token_hash` | CharField(64) | SHA-256 hash of refresh token |
| `user_agent` | CharField(500) | browser/OS info |
| `ip_address` | CharField(100) | |
| `device_name` | CharField(200) | |
| `created_at` | DateTimeField | auto |
| `last_activity` | DateTimeField | nullable |
| `expires_at` | DateTimeField | nullable |
| `is_revoked` | BooleanField | default False |

### AuditLog
Security and administrative event log.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `created_at` | DateTimeField | auto |
| `user` | FK → User | SET_NULL, nullable |
| `action` | CharField(200) | e.g. `login`, `logout` |
| `resource_type` | CharField(100) | nullable |
| `resource_id` | CharField(200) | nullable |
| `ip_address` | CharField(100) | nullable |
| `user_agent` | CharField(500) | nullable |
| `severity` | CharField(20) | default `info` |
| `metadata` | JSONField | nullable |

---

## `Eapp` app

### Task
Core business entity — a laptop repair job.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `title` | CharField(200) | |
| `description` | TextField | nullable |
| `status` | CharField choices | `Pending`, `In Progress`, `Awaiting Parts`, `Completed`, `Ready for Pickup`, `Picked Up` |
| `urgency` | CharField choices | `Yupo`, `Katoka kidogo`, `Kaacha`, `Expedited`, `Ina Haraka` |
| `payment_status` | CharField choices | `Unpaid`, `Partially Paid`, `Fully Paid`, `Refunded` |
| `device_type` | CharField choices | `Full`, `Not Full`, `Motherboard Only` |
| `workshop_status` | CharField choices | `In Workshop`, `Solved`, `Not Solved` (nullable) |
| `assigned_to` | FK → User | SET_NULL, nullable — the technician |
| `created_by` | FK → User | CASCADE |
| `customer` | FK → Customer | CASCADE |
| `brand` | FK → Brand | SET_NULL, nullable |
| `laptop_model` | FK → Model | SET_NULL, nullable |
| `current_location` | FK → Location | PROTECT |
| `estimated_cost` | DecimalField | nullable |
| `total_cost` | DecimalField | computed from estimated + cost breakdowns |
| `paid_amount` | DecimalField | aggregated from Payment records |
| `is_debt` | BooleanField | |
| `is_referred` | BooleanField | |
| `is_terminated` | BooleanField | |
| `to_be_checked` | BooleanField | QC flag |
| `referred_by` | FK → Referrer | SET_NULL, nullable |
| `date_in` | DateField | default today |
| `negotiated_by` | FK → User | SET_NULL, nullable |
| `first_assigned_at` | DateTimeField | auto-set on first assignment |
| `completed_at` | DateTimeField | auto-set on completion |
| `ready_for_pickup_at` | DateTimeField | auto-set |
| `return_count` | IntegerField | times returned to customer |
| `return_periods` | JSONField | list of `{returned_at, reassigned_at}` |
| `workshop_periods` | JSONField | list of `{sent_at, returned_at}` |
| `execution_technicians` | JSONField | list of `{user_id, name, role, assigned_at}` |
| `workshop_location` | FK → Location | SET_NULL, nullable |
| `original_technician_snapshot` | FK → User | SET_NULL, nullable |
| `original_location_snapshot` | FK → Location | SET_NULL, nullable |
| `created_at` | DateTimeField | auto |
| `updated_at` | DateTimeField | auto |

### TaskActivity
Immutable audit trail of events on a task.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `task` | FK → Task | CASCADE |
| `user` | FK → User | SET_NULL, nullable |
| `timestamp` | DateTimeField | auto |
| `type` | CharField choices | `status_update`, `note`, `diagnosis`, `customer_contact`, `intake`, `workshop`, `rejected`, `ready`, `returned`, `picked_up`, `device_note`, `assignment` |
| `message` | TextField | |
| `details` | JSONField | nullable |

---

## `financials` app

### Account
Financial account (linked 1:1 to a PaymentMethod).

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | unique |
| `balance` | DecimalField | |
| `created_by` | FK → User | SET_NULL, nullable |
| `created_at` | DateTimeField | auto |

### PaymentMethod
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | unique |
| `is_user_selectable` | BooleanField | show in UI dropdowns |
| `account` | OneToOneField → Account | nullable |

### PaymentCategory
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | unique |

### Payment
Customer payment against a task.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `task` | FK → Task | CASCADE, nullable |
| `amount` | DecimalField | positive = revenue, negative = refund |
| `date` | DateField | default today |
| `method` | FK → PaymentMethod | SET_NULL |
| `payment_method_name` | CharField(100) | snapshot |
| `description` | CharField(255) | default `Customer Payment` |
| `category` | FK → PaymentCategory | SET_NULL |

### CostBreakdown
Itemised cost adjustments on a task.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `task` | FK → Task | CASCADE |
| `description` | CharField(255) | |
| `amount` | DecimalField | |
| `cost_type` | CharField choices | `Additive`, `Subtractive`, `Inclusive` |
| `category` | CharField(100) | |
| `reason` | TextField | nullable |
| `payment_method` | FK → PaymentMethod | SET_NULL |
| `created_at` | DateTimeField | auto |

### TransactionRequest (extends ApprovalRequest)
Request for an expenditure or revenue transaction, requiring manager approval.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `transaction_type` | CharField choices | `Expenditure`, `Revenue` |
| `description` | TextField | |
| `amount` | DecimalField | |
| `task` | FK → Task | SET_NULL, nullable |
| `category` | FK → PaymentCategory | PROTECT |
| `payment_method` | FK → PaymentMethod | SET_NULL |
| `payment_method_name` | CharField(100) | snapshot |
| `cost_type` | CharField choices | `Additive`, `Subtractive`, `Inclusive` (nullable) |
| `status` | CharField choices | `Pending`, `Approved`, `Rejected` |
| `requester` | FK → User | SET_NULL |
| `approver` | FK → User | SET_NULL |
| `requester_name` | CharField(150) | snapshot |
| `approver_name` | CharField(150) | snapshot |
| `created_at` / `updated_at` | DateTimeField | auto |

### DebtRequest (extends ApprovalRequest)
Request to mark a task as debt.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `task` | FK → Task | CASCADE |
| `task_title` | CharField(255) | snapshot |
| `status` | CharField choices | `Pending`, `Approved`, `Rejected` |
| `requester` / `approver` | FK → User | SET_NULL |
| `requester_name` / `approver_name` | CharField(150) | snapshot |
| `created_at` / `updated_at` | DateTimeField | auto |

---

## `customers` app

### Customer
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | indexed |
| `customer_type` | CharField choices | `Normal`, `Repairman` |
| `created_at` | DateTimeField | auto |

### PhoneNumber
Many phone numbers per customer (field-level encrypted).

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `customer` | FK → Customer | CASCADE |
| `phone_number` | CharField(500) | unique, longer for encrypted values |

### Referrer
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | unique |
| `phone` | CharField(500) | nullable, encrypted |
| `created_at` | DateTimeField | auto |

---

## `messaging` app

### MessageLog
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `task` | FK → Task | CASCADE |
| `recipient_phone` | CharField(20) | |
| `message_content` | TextField | |
| `status` | CharField choices | `sent`, `failed`, `pending` |
| `sent_by` | FK → User | SET_NULL |
| `sent_at` | DateTimeField | auto |
| `response_data` | JSONField | Briq API response, nullable |

### MessageTemplate
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | unique |
| `content` | TextField | may contain template variables |
| `is_active` | BooleanField | default True |
| `created_at` | DateTimeField | auto |

### SchedulerNotification
Result of a scheduled job, for frontend notification display.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `job_type` | CharField choices | `pickup_reminder`, `debt_reminder` |
| `tasks_found` | PositiveIntegerField | |
| `messages_sent` | PositiveIntegerField | |
| `messages_failed` | PositiveIntegerField | |
| `failure_details` | JSONField | list of `{task_id, task_title, error}` |
| `created_at` | DateTimeField | auto |
| `acknowledged_by` | M2M → User | users who dismissed notification |

---

## `common` app

### Brand
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | unique |

### Model (device model)
| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | |
| `brand` | FK → Brand | CASCADE |
| unique_together | `name + brand` | |

### Location
Soft-deletable location (branch, workshop, etc.).

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField (PK) | |
| `name` | CharField(100) | unique |
| `is_workshop` | BooleanField | |
| `is_active` | BooleanField | default True (soft delete) |

Delete sets `is_active = False`. Use `.active_objects` manager for active-only queries.

---

## `settings` app

### SystemSettings (singleton)
Only one instance ever exists (`pk=1`).

| Field | Type | Notes |
|---|---|---|
| `company_name` | CharField(200) | used in SMS |
| `company_phone_numbers` | JSONField | list of strings |
| `auto_sms_on_task_creation` | BooleanField | default True |
| `auto_sms_on_ready_for_pickup` | BooleanField | default True |
| `auto_sms_on_picked_up` | BooleanField | default True |
| `auto_pickup_reminders_enabled` | BooleanField | default False |
| `pickup_reminder_hours` | PositiveIntegerField | default 24 |
| `auto_debt_reminders_enabled` | BooleanField | default False |
| `debt_reminder_hours` | PositiveIntegerField | default 72 |
| `debt_reminder_max_days` | PositiveIntegerField | default 30 |
| `storage_fee_per_day` | PositiveIntegerField | default 3000 (TSH) |
| `pickup_deadline_days` | PositiveIntegerField | default 7 |
| `updated_at` | DateTimeField | auto |
