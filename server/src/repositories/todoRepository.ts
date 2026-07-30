import { randomUUID } from "node:crypto"
import { db } from "../db.js"
import type { CreateTodoInput, Todo, UpdateTodoInput } from "../types/todo.js"

interface TodoRow {
  id: string
  title: string
  completed: number
  created_at: string
  updated_at: string
}

const toTodo = (row: TodoRow): Todo => ({
  id: row.id,
  title: row.title,
  completed: row.completed === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const listTodos = (): Todo[] => {
  const stmt = db.prepare("SELECT * FROM todos ORDER BY datetime(created_at) DESC")
  const rows = stmt.all() as TodoRow[]
  return rows.map(toTodo)
}

export const createTodo = (input: CreateTodoInput): Todo => {
  const now = new Date().toISOString()
  const id = randomUUID()

  const stmt = db.prepare(
    "INSERT INTO todos (id, title, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
  )
  stmt.run(id, input.title, 0, now, now)

  return {
    id,
    title: input.title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }
}

export const findTodoById = (id: string): Todo | null => {
  const stmt = db.prepare("SELECT * FROM todos WHERE id = ?")
  const row = stmt.get(id) as TodoRow | undefined
  return row ? toTodo(row) : null
}

export const updateTodo = (id: string, input: UpdateTodoInput): Todo | null => {
  const existing = findTodoById(id)
  if (!existing) {
    return null
  }

  const nextTitle = input.title ?? existing.title
  const nextCompleted = input.completed ?? existing.completed
  const now = new Date().toISOString()

  const stmt = db.prepare(
    "UPDATE todos SET title = ?, completed = ?, updated_at = ? WHERE id = ?",
  )
  stmt.run(nextTitle, nextCompleted ? 1 : 0, now, id)

  return {
    ...existing,
    title: nextTitle,
    completed: nextCompleted,
    updatedAt: now,
  }
}

export const deleteTodo = (id: string): boolean => {
  const stmt = db.prepare("DELETE FROM todos WHERE id = ?")
  const result = stmt.run(id)
  return result.changes > 0
}
