export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTodoInput {
  title: string
}

export interface UpdateTodoInput {
  title?: string
  completed?: boolean
}

export type TodoSortOption =
  | "createdAt_desc"
  | "createdAt_asc"
  | "updatedAt_desc"
  | "updatedAt_asc"
  | "title_desc"
  | "title_asc"

export interface ListTodosOptions {
  completed?: boolean
  search?: string
  sort?: TodoSortOption
  page?: number
  limit?: number
}
