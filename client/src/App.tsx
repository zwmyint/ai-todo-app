import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { addTodo, editTodo, getTodos, removeTodo, type ListOptions } from "./api/todos"
import type { Todo } from "./types/todo"
import "./App.css"

type Filter = "all" | "active" | "completed"

defaultSortOptions()

function defaultSortOptions() {
  return [
    { value: "createdAt_desc", label: "Newest" },
    { value: "createdAt_asc", label: "Oldest" },
  ]
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  // per-action states
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({})
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  // per-action errors
  const [loadError, setLoadError] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // UI filter / sort
  const [filter, setFilter] = useState<Filter>("all")
  const [sort, setSort] = useState<string>("createdAt_desc")

  const loadTodos = async (opts?: ListOptions) => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await getTodos(opts)
      setTodos(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to load todos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTodos({ sort })
  }, [sort])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    setIsAdding(true)
    setAddError(null)

    try {
      const created = await addTodo(trimmedTitle)
      setTodos((current) => [created, ...current])
      setTitle("")
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Unable to create todo")
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleCompleted = async (todo: Todo) => {
    setTogglingIds((s) => ({ ...s, [todo.id]: true }))
    setUpdateError(null)

    try {
      const updated = await editTodo(todo.id, { completed: !todo.completed })
      setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Unable to update todo")
    } finally {
      setTogglingIds((s) => {
        const ns = { ...s }
        delete ns[todo.id]
        return ns
      })
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingIds((s) => ({ ...s, [id]: true }))
    setDeleteError(null)

    try {
      await removeTodo(id)
      setTodos((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Unable to delete todo")
    } finally {
      setDeletingIds((s) => {
        const ns = { ...s }
        delete ns[id]
        return ns
      })
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingTitle(todo.title)
    setUpdateError(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const submitEdit = async (id: string) => {
    const trimmed = editingTitle.trim()
    if (trimmed.length === 0) {
      setUpdateError("Title must not be empty")
      return
    }

    setTogglingIds((s) => ({ ...s, [id]: true }))
    setUpdateError(null)

    try {
      const updated = await editTodo(id, { title: trimmed })
      setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      cancelEditing()
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Unable to update todo")
    } finally {
      setTogglingIds((s) => {
        const ns = { ...s }
        delete ns[id]
        return ns
      })
    }
  }

  const counts = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((t) => t.completed).length
    const active = total - completed
    return { total, completed, active }
  }, [todos])

  const visibleTodos = useMemo(() => {
    let list = todos.slice()
    if (filter === "active") list = list.filter((t) => !t.completed)
    if (filter === "completed") list = list.filter((t) => t.completed)
    return list
  }, [todos, filter])

  return (
    <main className="container">
      <h1>To-Do List</h1>

      <form onSubmit={handleSubmit} className="add-form">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a new task..."
          aria-label="Todo title"
        />
        <button type="submit" disabled={title.trim().length === 0 || isAdding}>
          {isAdding ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="meta">
        <div className="counts">
          <span>{counts.total} total</span>
          <span>{counts.active} active</span>
          <span>{counts.completed} completed</span>
        </div>

        <div className="controls">
          <div className="filter">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
              type="button"
            >
              All
            </button>
            <button
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
              type="button"
            >
              Active
            </button>
            <button
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
              type="button"
            >
              Completed
            </button>
          </div>

          <div className="sort">
            <label>
              Sort:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {defaultSortOptions().map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {loadError && <p className="error">{loadError}</p>}
      {addError && <p className="error">{addError}</p>}
      {updateError && <p className="error">{updateError}</p>}
      {deleteError && <p className="error">{deleteError}</p>}

      {isLoading && <p className="status">Loading todos...</p>}

      {!isLoading && visibleTodos.length === 0 && <p className="status">No tasks for this view.</p>}

      <ul className="todo-list">
        {visibleTodos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                disabled={!!togglingIds[todo.id]}
                onChange={() => void handleToggleCompleted(todo)}
              />

              {editingId === todo.id ? (
                <input
                  className="edit-input"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitEdit(todo.id)
                    if (e.key === "Escape") cancelEditing()
                  }}
                />
              ) : (
                <span className={todo.completed ? "completed" : ""}>{todo.title}</span>
              )}
            </label>

            <div className="actions">
              {editingId === todo.id ? (
                <>
                  <button type="button" onClick={() => void submitEdit(todo.id)} disabled={!!togglingIds[todo.id]}>
                    Save
                  </button>
                  <button type="button" onClick={cancelEditing}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => startEditing(todo)} disabled={!!deletingIds[todo.id]}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => void handleDelete(todo.id)} disabled={!!deletingIds[todo.id]}>
                    {deletingIds[todo.id] ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
