# DataBridge Frontend - Data Connectivity & Transfer Platform

This is the frontend client for the **Data Connectivity & Transfer Platform**, a scalable web
application designed to connect to multiple database systems, discover data structures, and
seamlessly move data between sources.

---

## 🚀 Features

- **Secure Access** — Protected routes, authentication flows, and session handling
- **Connection Management** — Add, verify, update, and remove PostgreSQL/MySQL connections
- **Data Discovery** — Explore schemas, tables, views, and column metadata
- **Data Preview** — Filter, sample, and preview data before execution
- **Data Transfer** — Step-by-step column mapping and batch data movement
- **Monitoring** — Dashboards with charts, activity logs, and execution transparency
- **Premium UI** — Responsive dark-mode design with custom canvas animations

---

## 🛠️ Tech Stack

| Tool             | Purpose                                      |
| ---------------- | -------------------------------------------- |
| React 19 + Vite  | UI framework with fast HMR                   |
| Tailwind CSS 4   | Styling with custom design tokens            |
| React Router v7  | Client-side routing                          |
| Axios            | API client with auth/error interceptors      |
| Lucide React     | Icon library                                 |
| Recharts         | Data visualization charts                   |
| React Toastify   | Toast notifications                          |

---

## 📁 Project Structure

```
src/
├── api/          # Axios config and endpoint service functions
├── assets/       # Static assets (images, logos)
├── components/   # Reusable UI components (buttons, inputs, AnimatedBackground)
├── context/      # React Context providers (Auth state)
├── hooks/        # Custom React hooks
├── layouts/      # Page layout wrappers (DashboardLayout, Sidebar)
├── pages/        # Route-level components (Dashboard, Auth, Connections, etc.)
├── utils/        # Helper functions, formatters, constants
├── App.jsx       # Root component with providers and router
└── main.jsx      # React entry point
```

---

## 🧠 Key Design Decisions

1. **Separation of Concerns** — UI lives in `components/` and `pages/`. API calls and
   business logic are abstracted into `api/` and `hooks/`. Components stay clean and focused.

2. **Lightweight Animations** — Background animations use the Canvas API (`AnimatedBackground.jsx`)
   instead of heavy libraries. Pure CSS and Tailwind handle micro-interactions for better performance.

3. **Responsive Design** — Mobile-first Tailwind utilities ensure the platform works across
   all screen sizes, including complex data tables and dashboards.

4. **Error Handling** — API failures are caught by Axios interceptors and surfaced via toast
   notifications. Loaders and hover states give users immediate feedback.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App available at `http://localhost:5173`

```bash
# Build for production
npm run build

# Lint
npm run lint
```

---

## 🔒 Environment Variables

Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1