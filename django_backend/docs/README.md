# A-Express Technologies — Django Backend

REST + WebSocket API for a **laptop repair shop management system**. Built with Django, Django REST Framework, and Django Channels.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Django 5.x |
| REST API | Django REST Framework (DRF) |
| Auth | JWT via `djangorestframework-simplejwt` (HttpOnly cookies) |
| Real-time | Django Channels + Redis (WebSockets) |
| ASGI Server | Daphne |
| WSGI Server | Gunicorn |
| Database | PostgreSQL (production) / SQLite (local fallback) |
| Connection Pooling | PgBouncer (optional, Railway) |
| Media Storage | Cloudinary (production) / local filesystem (dev) |
| Background Tasks | django-apscheduler |
| SMS | Briq SMS API (Tanzania) |
| Security | django-axes (brute-force protection), django-ratelimit |
| API Docs | drf-spectacular (OpenAPI 3.0 — Swagger UI + Redoc) |
| Deployment | Railway.app |

---

## Project Apps

| App | Purpose |
|---|---|
| `users` | Custom user model, JWT auth, sessions, audit log |
| `Eapp` | Tasks (repair jobs) — core business entity |
| `financials` | Payments, accounts, approval workflows |
| `customers` | Customer records and referrers |
| `messaging` | SMS via Briq, templates, scheduled reminders |
| `notifications` | WebSocket push notifications |
| `reports` | Analytics and reporting endpoints |
| `common` | Shared reference data (brands, locations, models) |
| `settings` | Singleton system settings |

---

## Interactive API Docs (Swagger / Redoc)

Once the server is running:

| UI | URL |
|---|---|
| Swagger UI | `http://localhost:8000/api/schema/swagger-ui/` |
| Redoc | `http://localhost:8000/api/schema/redoc/` |
| Raw OpenAPI YAML | `http://localhost:8000/api/schema/` |

---

## Local Development Setup

### 1. Clone and enter directory
```bash
cd django_backend
```

### 2. Create and activate virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
```bash
cp .env.example .env
# Then edit .env with your values (see Environment Variables section below)
```

### 5. Run database migrations
```bash
python manage.py migrate
```

### 6. Create a superuser (Manager role)
```bash
python manage.py createsuperuser
```

### 7. Start the development server
```bash
# HTTP only (no WebSockets)
python manage.py runserver

# With WebSocket support via Daphne
daphne -p 8000 A_express.asgi:application
```

---

## Environment Variables

All variables are loaded from `.env`. Copy `.env.example` to `.env` to get started.

### Required in Production

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key. Generate: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `FIELD_ENCRYPTION_KEY` | Encryption key for sensitive fields (phone numbers). Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `DATABASE_URL` | PostgreSQL connection URL. Format: `postgres://USER:PASSWORD@HOST:PORT/DATABASE` |

### Optional (with defaults)

| Variable | Default | Description |
|---|---|---|
| `DEBUG` | `False` | Enable Django debug mode (dev only) |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend origin for CORS |
| `RAILWAY_PUBLIC_DOMAIN` | — | Set automatically by Railway |
| `PGBOUNCER_URL` | — | PgBouncer host or full URL for connection pooling |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis for Django Channels. Falls back to in-memory if not set |
| `CLOUDINARY_URL` | — | Cloudinary URL for media storage. Falls back to local filesystem |
| `TASK_ID_YEAR_OFFSET` | — | Year offset used for task ID generation |

### SMS (Briq)

| Variable | Description |
|---|---|
| `BRIQ_API_KEY` | API key from https://briq.tz |
| `BRIQ_SENDER_ID` | SMS sender ID (default: `A-EXPRESS`) |

---

## Deployment (Railway)

The project is configured for Railway with:
- `railway.toml` — build and start commands
- `start.sh` — startup script (runs migrations + starts Daphne)
- Gunicorn/Daphne as the ASGI server
- WhiteNoise for serving static files
- PostgreSQL + optional PgBouncer for connection pooling
- Cloudinary for media file storage

To deploy: connect your repo to Railway and set the required environment variables above.
