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
  const { title, completed } = req.body ?? {}

  const hasTitle = title !== undefined
  const hasCompleted = completed !== undefined

  if (!hasTitle && !hasCompleted) {
    return sendError(res, 400, "at least one of title or completed is required")
  }

  let validatedTitle: string | undefined
  if (hasTitle) {
    const parsedTitle = validateTitle(title)
    if (parsedTitle === null) {
      return sendError(res, 400, "title must be a non-empty string and less than 200 characters")
    }
    validatedTitle = parsedTitle
  }

  let completedValue: boolean | undefined
  if (hasCompleted) {
    if (typeof completed !== "boolean") {
      return sendError(res, 400, "completed must be a boolean")
    }
    completedValue = completed
  }

  const todo = updateTodo(id, {
    title: validatedTitle,
    completed: completedValue,
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
        "sort must be one of createdAt_desc, createdAt_asc, updatedAt_desc, updatedAt_asc, title_desc, title_asc",
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

  const todos = listTodos({ completed, search, sort, page, limit })
  return res.status(200).json({ data: todos })
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
  const title = req.body?.title
  const validatedTitle = validateTitle(title)

  if (validatedTitle === null) {
    return sendError(res, 400, "title is required and must be 1-200 characters")
  }

  const todo = createTodo({ title: validatedTitle })
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
