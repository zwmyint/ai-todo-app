import { strict as assert } from "node:assert"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { beforeEach, describe, it } from "node:test"

process.env.NODE_ENV = "test"

const tempDir = mkdtempSync(join(tmpdir(), "todo-test-"))
process.env.DB_PATH = join(tempDir, "todos.db")

const { db, initializeDatabase } = await import("../src/db.js")

initializeDatabase()
const { createTodo, deleteTodo, findTodoById, listTodos, updateTodo } = await import(
  "../src/repositories/todoRepository.js",
)

beforeEach(() => {
  db.exec("DELETE FROM todos")
})

describe("todoRepository", () => {
  it("creates, reads, updates, and deletes a todo", () => {
    const todo = createTodo({ title: "Test Item" })
    assert.equal(todo.title, "Test Item")
    assert.equal(todo.completed, false)

    const fetched = findTodoById(todo.id)
    assert.ok(fetched)
    assert.equal(fetched?.title, todo.title)

    const updated = updateTodo(todo.id, { completed: true })
    assert.ok(updated)
    assert.equal(updated?.completed, true)

    const deleted = deleteTodo(todo.id)
    assert.equal(deleted, true)
    assert.equal(findTodoById(todo.id), null)
  })

  it("lists todos with filters", () => {
    createTodo({ title: "Learn tests" })
    createTodo({ title: "Write docs" })

    const allResult = listTodos()
    const all = Array.isArray(allResult) ? allResult : allResult.todos
    assert.equal(all.length, 2)

    const filteredResult = listTodos({ search: "tests" })
    const filtered = Array.isArray(filteredResult) ? filteredResult : filteredResult.todos
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].title, "Learn tests")
  })
})
