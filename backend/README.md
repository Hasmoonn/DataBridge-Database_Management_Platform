```markdown
# Data Connectivity & Transfer Platform

A web platform that enables users to connect to multiple database systems, explore data structures,
and transfer data between sources securely.

Built as part of a programmer internship task.

---

## Features

- **JWT Authentication** with token blacklisting on logout
- **Multi-DB Connection Management** (PostgreSQL & MySQL)
- **Data Discovery** — Browse schemas, tables, views, columns
- **Data Preview** with filtering, column selection, pagination
- **Data Transfer** with batch processing, column mapping, progress tracking
- **Monitoring Dashboard** — Connection status, transfer history, activity logs
- **Encrypted Credential Storage** using Fernet symmetric encryption

---

## 🛠 Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Language         | Python 3.11+                                  |
| Framework        | FastAPI                                       |
| Database         | PostgreSQL (via Neon)                         |
| Authentication   | JWT (python-jose) + passlib/bcrypt            |
| API Docs         | FastAPI built-in Swagger UI / ReDoc           |
| DB Drivers       | psycopg2-binary, mysql-connector-python       |
| Encryption       | cryptography (Fernet)                         |
| Server           | Uvicorn (ASGI)                                |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings (pydantic-settings)
│   ├── database.py          # SQLAlchemy engine + session
│   ├── dependencies.py      # JWT auth guard
│   │
│   ├── auth/                # Register, Login, Logout, Profile
│   ├── connections/         # DB connection CRUD + test
│   ├── discovery/           # Browse schemas, tables, columns
│   ├── transfers/           # Transfer jobs + execution logs
│   └── monitoring/          # Dashboard, history, activity logs
│
├── .env                     # Environment variables (gitignored)
├── requirements.txt
├── Dockerfile
└── README.md
```

Each module contains:
`models.py` · `schemas.py` · `router.py` · `service.py`

---

## Setup Instructions

### Step 1: Clone & Create Virtual Environment

```bash
git clone <your-repo-url>
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Setup Environment Variables

Create a `.env` file in the backend root:

```env
SECRET_KEY=your-generated-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Neon PostgreSQL - use direct host (without -pooler)
PGHOST=ep-your-project.ap-southeast-1.aws.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=your-neon-password
PGPORT=5432

ENCRYPTION_KEY=your-generated-fernet-key

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Generate keys:**

```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(50))"

# ENCRYPTION_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```


### Step 4: Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

> Database tables are created **automatically** on startup. No migrations needed.

---

## API Endpoints

### 🔐 Authentication — `/api/v1/auth/`

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| POST   | `/register/`      | Register new user        |
| POST   | `/login/`         | Login and get JWT tokens |
| POST   | `/logout/`        | Logout (blacklist tokens)|
| POST   | `/token/refresh/` | Refresh access token     |
| GET    | `/profile/`       | Get user profile         |
| PUT    | `/profile/`       | Update user profile      |

### 🔗 Connections — `/api/v1/connections/`

| Method        | Endpoint      | Description          |
| ------------- | ------------- | -------------------- |
| GET           | `/`           | List all connections |
| POST          | `/`           | Create connection    |
| GET           | `/{id}/`      | Get connection       |
| PUT / PATCH   | `/{id}/`      | Update connection    |
| DELETE        | `/{id}/`      | Delete connection    |
| POST          | `/{id}/test/` | Test connection      |

### 🔍 Discovery — `/api/v1/discovery/`

| Method | Endpoint                                              | Description     |
| ------ | ----------------------------------------------------- | --------------- |
| GET    | `/{conn_id}/schemas/`                                 | List schemas    |
| GET    | `/{conn_id}/schemas/{schema}/tables/`                 | List tables     |
| GET    | `/{conn_id}/schemas/{schema}/tables/{table}/columns/` | List columns    |
| POST   | `/{conn_id}/schemas/{schema}/tables/{table}/preview/` | Preview data    |

### 📤 Transfers — `/api/v1/transfers/`

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | `/`              | List transfer jobs  |
| POST   | `/`              | Create transfer job |
| GET    | `/{id}/`         | Get transfer        |
| DELETE | `/{id}/`         | Delete transfer     |
| POST   | `/{id}/execute/` | Execute transfer    |
| GET    | `/{id}/logs/`    | Get execution logs  |

### 📊 Monitoring — `/api/v1/monitoring/`

| Method | Endpoint               | Description        |
| ------ | ---------------------- | ------------------ |
| GET    | `/dashboard/`          | Dashboard summary  |
| GET    | `/connections/status/` | Connection status  |
| GET    | `/transfers/history/`  | Transfer history   |
| GET    | `/activity/`           | Activity logs      |

**API Docs:** http://localhost:8000/api/docs/  
**ReDoc:** http://localhost:8000/api/redoc/  
**Health:** http://localhost:8000/health/

All protected routes require:
```
Authorization: Bearer <your-access-token>
```

---

## Security

| Concern              | Implementation                                        |
| -------------------- | ----------------------------------------------------- |
| Authentication       | JWT access tokens (1h) + refresh tokens (7d)          |
| Logout               | Both tokens blacklisted server-side immediately       |
| Password Hashing     | bcrypt via passlib                                    |
| DB Credentials       | Encrypted at rest using Fernet (AES-128)              |
| SQL Injection        | Parameterized queries + alphanumeric column allowlist |
| CORS                 | Restricted to configured origins only                 |
| Permission Scoping   | Users can only access their own data                  |

---

## Key Design Decisions

**Service Layer Pattern** — Routers handle HTTP, services handle logic. Clean separation.

**SQLAlchemy Auto Table Creation** — No migration commands needed. Tables created on startup.

**JWT Blacklist** — Both access and refresh tokens are blacklisted on logout for immediate effect.

**Encrypted Credentials** — DB passwords encrypted with Fernet before storage. Key lives only in `.env`.

**Batch Transfers** — Data moved in configurable batches (default 1000 rows) to handle large datasets safely.

**Parameterized SQL** — All raw queries use `%s` placeholders. Column names validated before use.

---

## Assumptions

1. Each user manages their own connections (no team/organization model)
2. Destination tables must be pre-created before running a transfer
3. Transfer progress is polled via API (no real-time WebSocket streaming)
4. Transfers run synchronously — can be moved to background tasks in production
5. Only PostgreSQL and MySQL are supported (MVP scope)
6. Passwords are limited to 72 characters (bcrypt limit)

---

## Quick Test Flow

```
1. POST /api/v1/auth/register/     → create account
2. POST /api/v1/auth/login/        → get access token
3. POST /api/v1/connections/       → add a database connection
4. POST /api/v1/connections/{id}/test/     → verify it works
5. GET  /api/v1/discovery/{id}/schemas/    → browse schemas
6. POST /api/v1/discovery/{id}/schemas/{s}/tables/{t}/preview/ → preview data
7. POST /api/v1/transfers/         → create a transfer job
8. POST /api/v1/transfers/{id}/execute/    → run it
9. GET  /api/v1/transfers/{id}/logs/       → check logs
10. GET /api/v1/monitoring/dashboard/      → view summary
```

---

## Author

Built by **MOHAMED HASMOON** — Data Connectivity & Transfer Platform internship task
```