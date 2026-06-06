# 🔗 DataBridge - Data Connectivity & Transfer Platform

Welcome to **DataBridge**, a full-stack web platform built for seamless data connectivity,
discovery, and transfer between multiple database systems.

This project was developed to fulfill the requirements of the Programmer Recruitment Task,
demonstrating scalable backend design, secure credential handling, and a modern frontend architecture.

---

## 🏗 Architecture Overview

DataBridge is a decoupled full-stack application. The frontend communicates with the backend
via RESTful APIs protected by JWT authentication.

### 🎨 Frontend
- **Tech Stack**: React 19, Vite, Tailwind CSS 4, Axios, Recharts, Lucide React
- **Highlights**: Component-driven design, dark-mode UI with custom animations, global error
  handling via Axios interceptors, and responsive mobile-first approach
- 📖 **[Read the Frontend Documentation](./frontend/README.md)**

### ⚙️ Backend
- **Tech Stack**: Python 3.11+, FastAPI, SQLAlchemy 2.0, PostgreSQL (Neon), cryptography (Fernet)
- **Highlights**: Service-layer pattern separating business logic from routers, stateless JWT
  authentication with token blacklisting, encrypted database credential storage, and parameterized
  SQL for protection against injection attacks
- 📖 **[Read the Backend Documentation](./backend/README.md)**

---

## ✨ Core Features

1. **Secure Access** — JWT authentication with token blacklisting on logout
2. **Connection Management** — Connect to PostgreSQL and MySQL with AES-128 encrypted credentials
3. **Data Discovery** — Browse schemas, tables, views, and columns of connected databases
4. **Data Preview** — Filter and sample tabular data before initiating transfers
5. **Data Transfer** — Batch-processed data movement with column mapping and progress tracking
6. **Monitoring** — Dashboard for transfer history, connection status, and activity logs

---

## 🚀 Quick Setup

### Prerequisites
- Python 3.11+
- Node.js v18+
- A [Neon PostgreSQL](https://neon.tech) account

### 1. Start the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env         # then fill in your values

# Start the server (tables created automatically)
uvicorn app.main:app --reload --port 8000