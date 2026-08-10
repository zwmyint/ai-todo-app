# 📌 Copilot Instructions for This Project

This repository is a full-stack To-Do app with:

- `client/`: React + TypeScript (Vite) + Bootstrap 5 for UI
- `server/`: Node.js + Express REST API + TypeScript
- SQLite persistence in the backend (`better-sqlite3`)

## 🚀 Project goals

- Keep the app simple, reliable, and easy to understand.
- Prefer clear, typed code over clever abstractions.
- Preserve API response consistency (`{ data: ... }` for success, `{ error: ... }` for failures).

## 🛠️ Backend conventions (`server/`)

- Keep route handlers in `src/routes/*`.
- Keep DB access logic in `src/repositories/*`.
- Keep shared domain types in `src/types/*`.
- Validate request input explicitly and return proper HTTP status codes:
  - `400` for invalid input
  - `404` when resource not found
  - `500` for unexpected server errors
- Use ISO date strings for `createdAt` and `updatedAt`.
- Avoid silent fallbacks that hide backend errors.

## 🖥️ Frontend conventions (`client/`)

- Keep API calls in `src/api/*`.
- Keep shared types in `src/types/*`.
- UI should handle loading, error, and empty states.
- Avoid mutating state directly; use immutable updates.
- Keep components focused and readable.

## 🔑 Core Features

- Add, edit, delete tasks.
- Mark tasks as complete/incomplete.
- Due dates.
- Categorization (work, personal, etc.).
- Bootstrap 5 UI components for responsive design.

## 🌟 Advanced Features

- Priority levels (high, medium, low).
- Recurring tasks (daily, weekly).
- Search & filter tasks.
- Dark mode toggle.

## 📈 Future Enhancements

- Notifications: Email or push reminders.
- Analytics dashboard: Track productivity trends.

## 🌐 Environment Management

- `.env` files for secrets (DB URI, API URL, secret).
- Separate configs for dev, staging, production.

## 📊 Suggested Tech Stack

| Layer    | Tech Choice                                          |
| -------- | ---------------------------------------------------- |
| Frontend | React + TypeScript (Vite) + Bootstrap 5 for UI       |
| Backend  | Node.js + Express REST API + TypeScript              |
| Database | SQLite persistence in the backend (`better-sqlite3`) |

## 📡 API Contract (Sample Endpoints)

- `GET /api/todos` → Fetch/Returns todos all
- `POST /api/todos` → Creates a todo
- `GET /api/todos/:id` → Fetch/Returns a single todo by ID
- `PUT /api/todos/:id` → Updates a todo partially. The request body may include one or both fields
- `PATCH /api/todos/:id` → Updates a todo
- `DELETE /api/todos/:id` →Deletes a todo
- `GET /health` → Health check

## 🗃️ Data model

Todo shape:

```ts
{
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
  // New fields
  dueDate?: string | null
  priority?: number
  notes?: string | null
  category?: string | null
}
```

## 🛠️ Commands

- Frontend dev: `cd client && npm run dev`
- Backend dev: `cd server && npm run dev`
- Frontend build: `cd client && npm run build`
- Backend build: `cd server && npm run build`

## 📝 Change guidelines

- Make minimal, targeted changes.
- Do not refactor unrelated code.
- Update `README.md` when setup/run/API behavior changes.
- Keep TypeScript strictness intact (no `any` unless unavoidable).
