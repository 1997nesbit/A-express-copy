# Architecture Overview

## App Module Breakdown

```
django_backend/
├── A_express/          # Project config (settings, root URLs, ASGI/WSGI)
├── users/              # Auth, User model, sessions, audit log
├── Eapp/               # Tasks (core repair job entity)
├── financials/         # Payments, accounts, approval workflows
├── customers/          # Customer records and referrers
├── messaging/          # SMS via Briq, templates, scheduled reminders
├── notifications/      # WebSocket consumers and middleware
├── reports/            # Analytics and reporting
├── common/             # Reference data: brands, locations, device models
└── settings/           # Singleton SystemSettings model
```

---

## Authentication Flow

The API uses **HttpOnly cookie-based JWT** to prevent XSS token theft.

### Login
```
POST /api/auth/login/
  → validates credentials
  → issues access_token + refresh_token as HttpOnly cookies
  → returns user profile in response body
```

### Subsequent Requests
```
Browser → sends cookies automatically with every request
  → CookieJWTAuthentication reads access_token cookie
  → if access_token invalid/expired → silently attempts refresh using refresh_token cookie
  → if refresh_token also invalid → raises AuthenticationFailed
```

### Token Lifetimes
| Token | Lifetime |
|---|---|
| Access token | 15 minutes |
| Refresh token | 1 day |

Refresh tokens are **rotated** on every refresh (`ROTATE_REFRESH_TOKENS = True`) and old tokens are **blacklisted** (`BLACKLIST_AFTER_ROTATION = True`).

### Cookie Settings
| Setting | Dev | Production |
|---|---|---|
| `HttpOnly` | ✅ | ✅ |
| `Secure` | ❌ | ✅ (HTTPS only) |
| `SameSite` | `Lax` | `None` (cross-origin) |

### Brute-force Protection
`django-axes` locks an account after **5 failed login attempts** for 30 minutes (by username + IP combination).

---

## Role-Based Access Control

The system has four user roles:

| Role | Description |
|---|---|
| `Manager` | Full access; approves financial requests; manages users |
| `Front Desk` | Creates/manages tasks; handles customer intake |
| `Technician` | Views and updates assigned tasks |
| `Accountant` | Manages payments and financial records; submits approval requests |

Permissions are enforced via custom `permissions.py` classes in each app (not Django's object-level permissions).

---

## Data Flow — Task Lifecycle

```
Customer walks in
    ↓
Front Desk creates Task (status: Pending)
    ↓ (auto-SMS to customer via Briq)
Technician assigned → status: In Progress
    ↓
  [optional] Task sent to workshop → WorkshopStatus: In Workshop
    ↓
Technician completes → status: Completed → QC check
    ↓
Manager approves → status: Ready for Pickup (auto-SMS to customer)
    ↓
Customer pays → PaymentStatus updated
    ↓
Customer collects device → status: Picked Up (auto-SMS thank you / debt reminder)
```

---

## WebSocket Architecture

Django Channels with **Redis channel layer** for multi-instance support (falls back to in-memory for single-instance dev).

```
Client browser
    ↓ WS connect to /ws/notifications/
    ↓ JWT auth via middleware (reads access_token cookie)
    ↓ Added to role group: notifications_{role}
    ↓ Added to user group: user_{id}

Server events (via channel_layer.group_send)
    ↓ broadcast to role group or user group
    ↓ consumer forwards to WebSocket client as JSON
```

### WebSocket URL
```
ws://localhost:8000/ws/notifications/
```

### Channel Groups
| Group | Who receives |
|---|---|
| `notifications_manager` | All Manager users |
| `notifications_front_desk` | All Front Desk users |
| `notifications_technician` | All Technician users |
| `notifications_accountant` | All Accountant users |
| `user_{id}` | A specific user by ID |

---

## Background Jobs (APScheduler)

`django-apscheduler` runs scheduled jobs for automated SMS reminders:

| Job | Trigger | Description |
|---|---|---|
| Pickup Reminder | Every N hours (`pickup_reminder_hours`) | SMS to customers whose device is ready but not picked up |
| Debt Reminder | Every N hours (`debt_reminder_hours`) | SMS to customers with outstanding debt after pickup |

Both jobs are configurable via the **SystemSettings** singleton (`/api/system-settings/`).

---

## Media Storage

| Environment | Backend |
|---|---|
| Production | Cloudinary (`CLOUDINARY_URL` env var set) |
| Development | Local filesystem (`django_backend/media/`) |

Profile pictures are stored in `profile_pictures/{user_id}/{uuid}.{ext}`. Old pictures are automatically deleted when replaced.

---

## Security Overview

| Feature | Implementation |
|---|---|
| Brute-force protection | django-axes (lockout after 5 failed attempts) |
| XSS token protection | HttpOnly cookies (no localStorage) |
| CORS | django-cors-headers (whitelist-based) |
| HTTPS enforcement | HSTS in production (`SECURE_HSTS_SECONDS = 31536000`) |
| Static files | WhiteNoise |
| Phone number encryption | Field-level encryption (`common/encryption.py`) |
| Session tracking | `Session` model with SHA-256 hashed refresh tokens |
| Audit trail | `AuditLog` model for security events |
