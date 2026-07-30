import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { addTodo, editTodo, getTodos, removeTodo } from "./api/todos"
import type { Todo } from "./types/todo"
import "./App.css"

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTodos = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getTodos()
      setTodos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load todos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTodos()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    try {
      const created = await addTodo(trimmedTitle)
      setTodos((current) => [created, ...current])
      setTitle("")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create todo")
    }
  }

  const handleToggleCompleted = async (todo: Todo) => {
    try {
      const updated = await editTodo(todo.id, { completed: !todo.completed })
      setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update todo")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeTodo(id)
      setTodos((current) => current.filter((item) => item.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete todo")
    }
  }

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
        <button type="submit" disabled={title.trim().length === 0}>
          Add
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {isLoading && <p className="status">Loading todos...</p>}

      {!isLoading && todos.length === 0 && <p className="status">No tasks yet. Add your first one.</p>}

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => void handleToggleCompleted(todo)}
              />
              <span className={todo.completed ? "completed" : ""}>{todo.title}</span>
            </label>
            <button type="button" className="danger" onClick={() => void handleDelete(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
