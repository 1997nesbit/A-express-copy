# Users API

Base URL: `/api/`

All endpoints require authentication (HttpOnly cookie JWT) unless noted.

---

## Authentication

### POST `/api/auth/login/`
Login with username + password. Sets `access_token` and `refresh_token` cookies.

**Auth required:** No

**Request**
```json
{
  "username": "ivan",
  "password": "yourpassword"
}
```

**Response `200 OK`**
```json
{
  "id": 1,
  "username": "ivan",
  "email": "ivan@example.com",
  "first_name": "Ivan",
  "last_name": "Doe",
  "full_name": "Ivan Doe",
  "phone": "+255712345678",
  "role": "Manager",
  "is_workshop": false,
  "profile_picture": null,
  "profile_picture_url": null,
  "is_active": true,
  "created_at": "2024-01-15T08:00:00Z",
  "last_login": "2025-03-25T11:00:00Z",
  "active_task_count": 0
}
```

**Error `400 Bad Request`** — wrong credentials
```json
{
  "non_field_errors": ["Unable to log in with provided credentials."]
}
```

**Error `403 Forbidden`** — account locked by django-axes after 5 failed attempts.

---

### POST `/api/auth/logout/`
Clears JWT cookies and revokes the current session.

**Auth required:** Yes

**Response `204 No Content`**

---

### GET `/api/auth/me/`
Returns the currently authenticated user.

**Auth required:** Yes (cookie)

**Response `200 OK`** — same shape as login response.

---

### POST `/api/auth/refresh/`
Silently refreshes the access token using the `refresh_token` cookie.

**Auth required:** No (uses refresh cookie)

**Response `200 OK`**
```json
{ "detail": "Token refreshed successfully." }
```

---

### POST `/api/token/refresh/`
DRF SimpleJWT standard refresh endpoint (Bearer token in body, **not** cookie-based).

**Request**
```json
{ "refresh": "<refresh_token_string>" }
```

**Response `200 OK`**
```json
{ "access": "<new_access_token>" }
```

---

### GET `/api/csrf/`
Returns a CSRF token for frontend use.

**Auth required:** No

**Response `200 OK`**
```json
{ "csrfToken": "abc123..." }
```

---

## User Management

### GET `/api/users/`
List all users. Managers only.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "username": "ivan",
    "email": "ivan@example.com",
    "first_name": "Ivan",
    "last_name": "Doe",
    "full_name": "Ivan Doe",
    "phone": "+255712345678",
    "role": "Manager",
    "is_workshop": false,
    "profile_picture": null,
    "profile_picture_url": null,
    "is_active": true,
    "created_at": "2024-01-15T08:00:00Z",
    "last_login": "2025-03-25T11:00:00Z",
    "active_task_count": 3
  }
]
```

---

### POST `/api/users/`
Create a new user. **Manager role required.**

**Request**
```json
{
  "username": "ali",
  "email": "ali@example.com",
  "password": "securepass123",
  "first_name": "Ali",
  "last_name": "Hassan",
  "phone": "+255700000001",
  "role": "Technician",
  "is_workshop": false
}
```

**Response `201 Created`** — returns full `UserSerializer` shape.

---

### GET `/api/users/{id}/`
Retrieve a single user.

**Response `200 OK`** — full `UserSerializer` shape.

---

### PATCH `/api/users/{id}/`
Partially update a user. Managers can update anyone; other roles can only update themselves.

**Request** (all fields optional)
```json
{
  "first_name": "Alison",
  "phone": "+255700000099"
}
```

---

### DELETE `/api/users/{id}/`
Delete a user. **Manager role required.**

**Response `204 No Content`**

---

### POST `/api/users/{id}/change_password/`
Change a user's password.

**Request**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

**Response `200 OK`**
```json
{ "detail": "Password changed successfully." }
```

---

### GET `/api/list/`
Lightweight list of users (full name only). Used for dropdowns.

**Response `200 OK`**
```json
[
  { "full_name": "Ivan Doe" },
  { "full_name": "Ali Hassan" }
]
```

---

## Profile Picture

### POST `/api/profile/upload-picture/`
Upload or replace the current user's profile picture.

**Auth required:** Yes

**Request** — `multipart/form-data` with field `profile_picture` (image file)

**Response `200 OK`**
```json
{
  "profile_picture_url": "https://res.cloudinary.com/your-cloud/image/upload/v123/profile_pictures/1/abc.png"
}
```

---

## Sessions

### GET `/api/users/profile/sessions/`
List all active sessions for the current user.

**Response `200 OK`**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "device_name": "Chrome on Windows",
    "device_info": "Chrome on Windows",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "ip_address": "192.168.1.1",
    "created_at": "2025-03-20T09:00:00Z",
    "last_activity": "2025-03-25T11:00:00Z",
    "expires_at": "2025-03-26T11:00:00Z",
    "is_revoked": false,
    "is_current": true
  }
]
```

---

### POST `/api/users/profile/sessions/{session_id}/revoke/`
Revoke a specific session by UUID.

**Response `200 OK`**
```json
{ "detail": "Session revoked." }
```

---

### POST `/api/users/profile/sessions/revoke-all/`
Revoke all sessions except the current one.

**Response `200 OK`**
```json
{ "detail": "All other sessions revoked." }
```

---

### GET `/api/users/profile/activity/`
Recent audit log entries for the current user.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "created_at": "2025-03-25T11:00:00Z",
    "user": "ivan",
    "action": "login",
    "resource_type": null,
    "resource_id": null,
    "severity": "info",
    "metadata": { "ip": "192.168.1.1" }
  }
]
```

---

## Dashboards

### GET `/api/technician-dashboard-stats/`
Stats for the logged-in technician.

**Roles:** Technician

**Response `200 OK`**
```json
{
  "active_tasks": 5,
  "completed_today": 2,
  "pending_tasks": 3
}
```
