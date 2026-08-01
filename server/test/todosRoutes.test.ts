import request from "supertest"
import { strict as assert } from "node:assert"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { beforeEach, describe, it } from "node:test"

process.env.NODE_ENV = "test"

const tempDir = mkdtempSync(join(tmpdir(), "todo-route-test-"))
process.env.DB_PATH = join(tempDir, "todos.db")

const { db, initializeDatabase } = await import("../src/db.js")
initializeDatabase()

const { app } = await import("../src/app.js")

beforeEach(() => {
  db.exec("DELETE FROM todos")
})

describe("todos routes", () => {
  it("returns an empty list initially", async () => {
    const response = await request(app).get("/api/todos")
    assert.equal(response.status, 200)
    assert.ok(Array.isArray(response.body.data))
    assert.equal(response.body.data.length, 0)
  })

  it("creates and returns a todo", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .send({ title: "Route task" })
      .set("Content-Type", "application/json")

    assert.equal(createResponse.status, 201)
    assert.equal(createResponse.body.data.title, "Route task")

    const id = createResponse.body.data.id
    const getResponse = await request(app).get(`/api/todos/${id}`)
    assert.equal(getResponse.status, 200)
    assert.equal(getResponse.body.data.id, id)
  })

  it("returns 400 for invalid create payload", async () => {
    const response = await request(app)
      .post("/api/todos")
      .send({ title: "" })
      .set("Content-Type", "application/json")

    assert.equal(response.status, 400)
    assert.equal(response.body.error, "title is required and must be 1-200 characters")
  })
})
