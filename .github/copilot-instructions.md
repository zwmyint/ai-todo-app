# Copilot Instructions for This Project

This repository is a full-stack To-Do app with:
- `client/`: React + TypeScript (Vite)
- `server/`: Node.js + Express + TypeScript
- SQLite persistence in the backend (`better-sqlite3`)

## Project goals
- Keep the app simple, reliable, and easy to understand.
- Prefer clear, typed code over clever abstractions.
- Preserve API response consistency (`{ data: ... }` for success, `{ error: ... }` for failures).

## Backend conventions (`server/`)
- Keep route handlers in `src/routes/*`.
- Keep DB access logic in `src/repositories/*`.
- Keep shared domain types in `src/types/*`.
- Validate request input explicitly and return proper HTTP status codes:
  - `400` for invalid input
  - `404` when resource not found
  - `500` for unexpected server errors
- Use ISO date strings for `createdAt` and `updatedAt`.
- Avoid silent fallbacks that hide backend errors.

## Frontend conventions (`client/`)
- Keep API calls in `src/api/*`.
- Keep shared types in `src/types/*`.
- UI should handle loading, error, and empty states.
- Avoid mutating state directly; use immutable updates.
- Keep components focused and readable.

## Data model
Todo shape:
```ts
{
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}
```

## Commands
- Frontend dev: `cd client && npm run dev`
- Backend dev: `cd server && npm run dev`
- Frontend build: `cd client && npm run build`
- Backend build: `cd server && npm run build`

## Change guidelines
- Make minimal, targeted changes.
- Do not refactor unrelated code.
- Update `README.md` when setup/run/API behavior changes.
- Keep TypeScript strictness intact (no `any` unless unavoidable).
