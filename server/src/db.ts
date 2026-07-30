import Database from "better-sqlite3"
import { dirname } from "node:path"
import { mkdirSync } from "node:fs"

const dbPath = process.env.DB_PATH ?? "./data/todos.db"
const dbDir = dirname(dbPath)

mkdirSync(dbDir, { recursive: true })

export const db = new Database(dbPath)

db.pragma("journal_mode = WAL")

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)
