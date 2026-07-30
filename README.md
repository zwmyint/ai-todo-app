# To-Do List App (React + TypeScript + Express + SQLite)

This project is a full-stack To-Do List application with:
- `client/` — React + TypeScript UI (Vite)
- `server/` — Node.js + Express API (TypeScript)
- SQLite persistence for todos

## 1. Prerequisites

- Node.js 20+ (or newer LTS)
- npm

## 2. Project structure

```
ai-todo-app/
  client/
  server/
```

## 3. Setup

Install dependencies:

```bash
cd client && npm install
cd ../server && npm install
```

Create local env files from examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

## 4. Run the app

Start backend (Terminal 1):

```bash
cd server
npm run dev
```

Start frontend (Terminal 2):

```bash
cd client
npm run dev
```

Open the frontend URL shown by Vite (usually `http://localhost:5173`).

## 5. Build for production

Backend:

```bash
cd server
npm run build
npm start
```

Frontend:

```bash
cd client
npm run build
```

## 6. API endpoints

Base URL: `http://localhost:4000`

1. `GET /health`  
   Health check.

2. `GET /api/todos`  
   Returns all todos.

3. `POST /api/todos`  
   Creates a todo.
   ```json
   { "title": "Buy milk" }
   ```

4. `PUT /api/todos/:id`  
   Updates todo title and/or completion.
   ```json
   { "completed": true }
   ```

5. `DELETE /api/todos/:id`  
   Deletes a todo.

## 7. Todo data model

```ts
{
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}
```
