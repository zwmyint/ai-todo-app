export interface Todo {
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

export interface CreateTodoInput {
  title: string
  dueDate?: string | null
  priority?: number
  notes?: string | null
  category?: string | null
}

export interface UpdateTodoInput {
  title?: string
  completed?: boolean
  dueDate?: string | null
  priority?: number
  notes?: string | null
  category?: string | null
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

export interface ListTodosOptions {
  completed?: boolean
  search?: string
  sort?: TodoSortOption
  page?: number
  limit?: number
}

export interface ListTodosResult {
  todos: Todo[]
  total: number
}
