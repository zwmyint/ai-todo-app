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

export const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch(TODOS_ENDPOINT)
  return assertOk<Todo[]>(response)
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
