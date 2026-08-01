import express, { Router } from "express"
import {
  createTodo,
  deleteTodo,
  findTodoById,
  listTodos,
  updateTodo,
} from "../repositories/todoRepository.js"
import type { TodoSortOption } from "../types/todo.js"

const MAX_TITLE_LENGTH = 200
const MAX_SEARCH_LENGTH = 200
const MAX_NOTES_LENGTH = 2000
const MAX_CATEGORY_LENGTH = 100
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 50

const todosRouter = Router()

const sendError = (res: express.Response, status: number, message: string) =>
  res.status(status).json({ error: message })

const parseBooleanString = (value: string): boolean | null => {
  const normalized = value.trim().toLowerCase()
  if (normalized === "true") return true
  if (normalized === "false") return false
  return null
}

const parsePositiveInteger = (value: string, fieldName: string): number | null => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

const parseSortOption = (value: string | undefined): TodoSortOption | null => {
  if (!value) {
    return null
  }

  const allowedSorts: TodoSortOption[] = [
    "createdAt_desc",
    "createdAt_asc",
    "updatedAt_desc",
    "updatedAt_asc",
    "title_desc",
    "title_asc",
    "dueDate_asc",
    "dueDate_desc",
  ]

  return allowedSorts.includes(value as TodoSortOption) ? (value as TodoSortOption) : null
}

const validateTitle = (title: unknown): string | null => {
  if (typeof title !== "string") {
    return null
  }

  const trimmed = title.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_TITLE_LENGTH) {
    return null
  }

  return trimmed
}

const validateOptionalString = (value: unknown, maxLen: number): string | null => {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > maxLen) return null
  return trimmed
}

const parseISODate = (value: unknown): string | null => {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

const getRouteId = (params: Record<string, unknown> | undefined): string => {
  const id = params?.id
  if (Array.isArray(id)) {
    return typeof id[0] === "string" ? id[0] : ""
  }

  if (typeof id === "string") {
    return id
  }

  return ""
}

const handleUpdate = (req: express.Request, res: express.Response) => {
  const id = getRouteId(req.params)
  const { title, completed, dueDate, priority, notes, category } = req.body ?? {}

  const hasAny =
    title !== undefined ||
    completed !== undefined ||
    dueDate !== undefined ||
    priority !== undefined ||
    notes !== undefined ||
    category !== undefined

  if (!hasAny) {
    return sendError(res, 400, "at least one field is required to update")
  }

  let validatedTitle: string | undefined
  if (title !== undefined) {
    const parsedTitle = validateTitle(title)
    if (parsedTitle === null) {
      return sendError(res, 400, "title must be a non-empty string and less than 200 characters")
    }
    validatedTitle = parsedTitle
  }

  let completedValue: boolean | undefined
  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return sendError(res, 400, "completed must be a boolean")
    }
    completedValue = completed
  }

  let validatedDueDate: string | undefined
  if (dueDate !== undefined) {
    const parsed = parseISODate(dueDate)
    if (parsed === null) return sendError(res, 400, "dueDate must be a valid ISO date string")
    validatedDueDate = parsed
  }

  let validatedPriority: number | undefined
  if (priority !== undefined) {
    if (!Number.isInteger(priority) || priority < 0 || priority > 5) {
      return sendError(res, 400, "priority must be an integer between 0 and 5")
    }
    validatedPriority = priority
  }

  let validatedNotes: string | undefined
  if (notes !== undefined) {
    const parsed = validateOptionalString(notes, MAX_NOTES_LENGTH)
    if (parsed === null) return sendError(res, 400, "notes must be a non-empty string under 2000 chars")
    validatedNotes = parsed
  }

  let validatedCategory: string | undefined
  if (category !== undefined) {
    const parsed = validateOptionalString(category, MAX_CATEGORY_LENGTH)
    if (parsed === null) return sendError(res, 400, "category must be a non-empty string under 100 chars")
    validatedCategory = parsed
  }

  const todo = updateTodo(id, {
    title: validatedTitle,
    completed: completedValue,
    dueDate: validatedDueDate,
    priority: validatedPriority,
    notes: validatedNotes,
    category: validatedCategory,
  })

  if (!todo) {
    return sendError(res, 404, "todo not found")
  }

  return res.status(200).json({ data: todo })
}

const validateSearchTerm = (search: unknown): string | null => {
  if (search === undefined) {
    return null
  }

  if (typeof search !== "string") {
    return null
  }

  const normalized = search.trim()
  if (normalized.length === 0 || normalized.length > MAX_SEARCH_LENGTH) {
    return null
  }

  return normalized
}

todosRouter.get("/", (req, res) => {
  const query = req.query
  let completed: boolean | undefined
  let search: string | undefined
  let sort: TodoSortOption | undefined
  let page: number | undefined
  let limit: number | undefined

  if (query.completed !== undefined) {
    if (typeof query.completed !== "string") {
      return sendError(res, 400, "completed must be true or false")
    }

    const parsed = parseBooleanString(query.completed)
    if (parsed === null) {
      return sendError(res, 400, "completed must be true or false")
    }
    completed = parsed
  }

  if (query.search !== undefined) {
    const parsed = validateSearchTerm(query.search)
    if (parsed === null) {
      return sendError(res, 400, "search must be a non-empty string under 200 characters")
    }
    search = parsed
  }

  if (query.sort !== undefined) {
    if (typeof query.sort !== "string") {
      return sendError(res, 400, "sort must be a valid sort option")
    }
    const parsed = parseSortOption(query.sort)
    if (parsed === null) {
      return sendError(
        res,
        400,
        "sort must be one of createdAt_desc, createdAt_asc, updatedAt_desc, updatedAt_asc, title_desc, title_asc, dueDate_asc, dueDate_desc",
      )
    }
    sort = parsed
  }

  if (query.limit !== undefined) {
    if (typeof query.limit !== "string") {
      return sendError(res, 400, "limit must be a positive integer")
    }
    const parsed = parsePositiveInteger(query.limit, "limit")
    if (parsed === null || parsed > MAX_LIMIT) {
      return sendError(res, 400, `limit must be a positive integer no greater than ${MAX_LIMIT}`)
    }
    limit = parsed
  }

  if (query.page !== undefined) {
    if (typeof query.page !== "string") {
      return sendError(res, 400, "page must be a positive integer")
    }
    const parsed = parsePositiveInteger(query.page, "page")
    if (parsed === null) {
      return sendError(res, 400, "page must be a positive integer")
    }
    page = parsed
  }

  if (page !== undefined && limit === undefined) {
    limit = DEFAULT_LIMIT
  }

  const result = listTodos({ completed, search, sort, page, limit })

  // Preserve backward compatibility: when page/limit present, return items with total
  if (page !== undefined || limit !== undefined) {
    return res.status(200).json({ data: { items: result.todos, total: result.total } })
  }

  return res.status(200).json({ data: result.todos })
})

todosRouter.get("/:id", (req, res) => {
  const id = getRouteId(req.params)
  const todo = findTodoById(id)

  if (!todo) {
    return sendError(res, 404, "todo not found")
  }

  return res.status(200).json({ data: todo })
})

todosRouter.post("/", (req, res) => {
  const { title, dueDate, priority, notes, category } = req.body ?? {}

  const validatedTitle = validateTitle(title)
  if (validatedTitle === null) {
    return sendError(res, 400, "title is required and must be 1-200 characters")
  }

  let validatedDueDate: string | null = null
  if (dueDate !== undefined) {
    const parsed = parseISODate(dueDate)
    if (parsed === null) return sendError(res, 400, "dueDate must be a valid ISO date string")
    validatedDueDate = parsed
  }

  let validatedPriority: number | undefined = undefined
  if (priority !== undefined) {
    if (!Number.isInteger(priority) || priority < 0 || priority > 5) {
      return sendError(res, 400, "priority must be an integer between 0 and 5")
    }
    validatedPriority = priority
  }

  const validatedNotes = validateOptionalString(notes, MAX_NOTES_LENGTH)
  const validatedCategory = validateOptionalString(category, MAX_CATEGORY_LENGTH)

  const todo = createTodo({
    title: validatedTitle,
    dueDate: validatedDueDate ?? undefined,
    priority: validatedPriority,
    notes: validatedNotes ?? undefined,
    category: validatedCategory ?? undefined,
  })

  return res.status(201).json({ data: todo })
})

todosRouter.put("/:id", handleUpdate)

todosRouter.patch("/:id", handleUpdate)

todosRouter.delete("/:id", (req, res) => {
  const id = getRouteId(req.params)
  const deleted = deleteTodo(id)

  if (!deleted) {
    return sendError(res, 404, "todo not found")
  }

  return res.status(204).send()
})

export { todosRouter }
