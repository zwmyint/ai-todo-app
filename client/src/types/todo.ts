export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
  dueDate?: string | null
  priority?: number
  notes?: string | null
  category?: string | null
}
