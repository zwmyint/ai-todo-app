import type { Todo } from "../types/todo"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"
const TODOS_ENDPOINT = `${API_URL}/api/todos`

type ApiResponse<T> = { data: T } | { error: string }

const assertOk = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok) {
    const message = "error" in payload ? payload.error : "request failed"
    throw new Error(message)
  }

  if (!("data" in payload)) {
    throw new Error("invalid response payload")
  }

  return payload.data
}

export type TodoSortOption =
  | "createdAt_desc"
  | "createdAt_asc"
  | "updatedAt_desc"
  | "updatedAt_asc"
  | "title_desc"
  | "title_asc"
  | "dueDate_asc"
  | "dueDate_desc"

export type ListOptions = {
  completed?: boolean
  search?: string
  sort?: TodoSortOption | string
  page?: number
  limit?: number
}

const buildQuery = (opts?: ListOptions) => {
  if (!opts) return ""
  const params = new URLSearchParams()
  if (opts.completed !== undefined) params.set("completed", String(opts.completed))
  if (opts.search) params.set("search", opts.search)
  if (opts.sort) params.set("sort", opts.sort)
  if (opts.page !== undefined) params.set("page", String(opts.page))
  if (opts.limit !== undefined) params.set("limit", String(opts.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export type PaginatedTodos = { items: Todo[]; total: number }

export const getTodos = async (
  opts?: ListOptions,
): Promise<Todo[] | PaginatedTodos> => {
  const qs = buildQuery(opts)
  const response = await fetch(`${TODOS_ENDPOINT}${qs}`)
  const data = await assertOk<any>(response)
  // server returns `{ data: [...] }` for non-paginated and `{ data: { items, total } }` for paginated
  if (data && typeof data === "object" && Array.isArray(data.items) && typeof data.total === "number") {
    return { items: data.items as Todo[], total: data.total }
  }
  return data as Todo[]
}

export const addTodo = async (title: string): Promise<Todo> => {
  const response = await fetch(TODOS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })
  return assertOk<Todo>(response)
}

export const editTodo = async (
  id: string,
  payload: { title?: string; completed?: boolean },
): Promise<Todo> => {
  const response = await fetch(`${TODOS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return assertOk<Todo>(response)
}

export const removeTodo = async (id: string): Promise<void> => {
  const response = await fetch(`${TODOS_ENDPOINT}/${id}`, { method: "DELETE" })

  if (!response.ok) {
    const payload = (await response.json()) as ApiResponse<unknown>
    const message = "error" in payload ? payload.error : "request failed"
    throw new Error(message)
  }
}
