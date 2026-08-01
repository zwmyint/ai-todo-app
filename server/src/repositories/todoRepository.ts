import { randomUUID } from "node:crypto"
import { db, DatabaseError } from "../db.js"
import type {
  CreateTodoInput,
  ListTodosOptions,
  Todo,
  TodoSortOption,
  UpdateTodoInput,
} from "../types/todo.js"

interface TodoRow {
  id: string
  title: string
  completed: number
  created_at: string
  updated_at: string
  due_date?: string | null
  priority?: number
  notes?: string | null
  category?: string | null
}

const sortMapping: Record<TodoSortOption, string> = {
  createdAt_desc: "datetime(created_at) DESC",
  createdAt_asc: "datetime(created_at) ASC",
  updatedAt_desc: "datetime(updated_at) DESC",
  updatedAt_asc: "datetime(updated_at) ASC",
  title_desc: "title COLLATE NOCASE DESC",
  title_asc: "title COLLATE NOCASE ASC",
  dueDate_asc: "datetime(due_date) ASC",
  dueDate_desc: "datetime(due_date) DESC",
}

const toTodo = (row: TodoRow): Todo => ({
  id: row.id,
  title: row.title,
  completed: row.completed === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  dueDate: row.due_date ?? null,
  priority: row.priority ?? 0,
  notes: row.notes ?? null,
  category: row.category ?? null,
})

const runDatabaseOperation = <T>(operation: () => T): T => {
  try {
    return operation()
  } catch (error) {
    console.error("Database operation failed", error)
    throw new DatabaseError("Database operation failed", error)
  }
}

export const listTodos = (options?: ListTodosOptions): ListTodosResult =>
  runDatabaseOperation(() => {
    const clauses: string[] = []
    const params: unknown[] = []

    if (options?.completed !== undefined) {
      clauses.push("completed = ?")
      params.push(options.completed ? 1 : 0)
    }

    if (options?.search) {
      // search across title, notes, and category
      clauses.push("(LOWER(title) LIKE ? OR LOWER(coalesce(notes, '')) LIKE ? OR LOWER(coalesce(category, '')) LIKE ?)")
      const s = `%${options.search.toLowerCase()}%`
      params.push(s, s, s)
    }

    // build count query (without order/limit/offset)
    let countSql = "SELECT COUNT(*) as cnt FROM todos"
    if (clauses.length > 0) {
      countSql += ` WHERE ${clauses.join(" AND ")}`
    }

    const countStmt = db.prepare(countSql)
    const countRow = countStmt.get(...params) as { cnt: number }
    const total = typeof countRow?.cnt === "number" ? countRow.cnt : 0

    let sql = "SELECT * FROM todos"
    if (clauses.length > 0) {
      sql += ` WHERE ${clauses.join(" AND ")}`
    }

    const orderBy = options?.sort ? sortMapping[options.sort] : sortMapping.createdAt_desc
    sql += ` ORDER BY ${orderBy}`

    const queryParams = [...params]

    if (options?.limit !== undefined) {
      sql += " LIMIT ?"
      queryParams.push(options.limit)
    }

    if (options?.page !== undefined && options?.limit !== undefined) {
      sql += " OFFSET ?"
      queryParams.push((options.page - 1) * options.limit)
    }

    const stmt = db.prepare(sql)
    const rows = stmt.all(...queryParams) as TodoRow[]
    return { todos: rows.map(toTodo), total }
  })

export const createTodo = (input: CreateTodoInput): Todo =>
  runDatabaseOperation(() => {
    const now = new Date().toISOString()
    const id = randomUUID()

    const stmt = db.prepare(
      "INSERT INTO todos (id, title, completed, created_at, updated_at, due_date, priority, notes, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    stmt.run(
      id,
      input.title,
      0,
      now,
      now,
      input.dueDate ?? null,
      input.priority ?? 0,
      input.notes ?? null,
      input.category ?? null,
    )

    return {
      id,
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
      dueDate: input.dueDate ?? null,
      priority: input.priority ?? 0,
      notes: input.notes ?? null,
      category: input.category ?? null,
    }
  })

export const findTodoById = (id: string): Todo | null =>
  runDatabaseOperation(() => {
    const stmt = db.prepare("SELECT * FROM todos WHERE id = ?")
    const row = stmt.get(id) as TodoRow | undefined
    return row ? toTodo(row) : null
  })

export const updateTodo = (id: string, input: UpdateTodoInput): Todo | null =>
  runDatabaseOperation(() => {
    const existing = findTodoById(id)
    if (!existing) {
      return null
    }

    const nextTitle = input.title ?? existing.title
    const nextCompleted = input.completed ?? existing.completed
    const nextDue = input.dueDate !== undefined ? input.dueDate : existing.dueDate
    const nextPriority = input.priority !== undefined ? input.priority : existing.priority ?? 0
    const nextNotes = input.notes !== undefined ? input.notes : existing.notes
    const nextCategory = input.category !== undefined ? input.category : existing.category

    const now = new Date().toISOString()

    const stmt = db.prepare(
      "UPDATE todos SET title = ?, completed = ?, updated_at = ?, due_date = ?, priority = ?, notes = ?, category = ? WHERE id = ?",
    )
    stmt.run(nextTitle, nextCompleted ? 1 : 0, now, nextDue ?? null, nextPriority ?? 0, nextNotes ?? null, nextCategory ?? null, id)

    return {
      ...existing,
      title: nextTitle,
      completed: nextCompleted,
      updatedAt: now,
      dueDate: nextDue ?? null,
      priority: nextPriority ?? 0,
      notes: nextNotes ?? null,
      category: nextCategory ?? null,
    }
  })

export const deleteTodo = (id: string): boolean =>
  runDatabaseOperation(() => {
    const stmt = db.prepare("DELETE FROM todos WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  })
