import { Router } from "express"
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "../repositories/todoRepository.js"

export const todosRouter = Router()

todosRouter.get("/", (_req, res) => {
  const todos = listTodos()
  res.status(200).json({ data: todos })
})

todosRouter.post("/", (req, res) => {
  const title = req.body?.title

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "title is required" })
    return
  }

  const todo = createTodo({ title: title.trim() })
  res.status(201).json({ data: todo })
})

todosRouter.put("/:id", (req, res) => {
  const { id } = req.params
  const { title, completed } = req.body ?? {}

  const hasTitle = title !== undefined
  const hasCompleted = completed !== undefined

  if (!hasTitle && !hasCompleted) {
    res.status(400).json({ error: "at least one of title or completed is required" })
    return
  }

  if (hasTitle && (typeof title !== "string" || title.trim().length === 0)) {
    res.status(400).json({ error: "title must be a non-empty string" })
    return
  }

  if (hasCompleted && typeof completed !== "boolean") {
    res.status(400).json({ error: "completed must be a boolean" })
    return
  }

  const todo = updateTodo(id, {
    title: hasTitle ? title.trim() : undefined,
    completed: hasCompleted ? completed : undefined,
  })

  if (!todo) {
    res.status(404).json({ error: "todo not found" })
    return
  }

  res.status(200).json({ data: todo })
})

todosRouter.delete("/:id", (req, res) => {
  const { id } = req.params
  const deleted = deleteTodo(id)

  if (!deleted) {
    res.status(404).json({ error: "todo not found" })
    return
  }

  res.status(204).send()
})
