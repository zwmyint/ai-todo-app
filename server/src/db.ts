import Database from "better-sqlite3"
import { dirname } from "node:path"
import { mkdirSync } from "node:fs"
import { config } from "./config.js"

export class DatabaseError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = "DatabaseError"
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack
    }
  }
}

const dbPath = config.dbPath
const dbDir = dirname(dbPath)

mkdirSync(dbDir, { recursive: true })

export const db = new Database(dbPath)

db.pragma("journal_mode = WAL")

const CURRENT_SCHEMA_VERSION = 1

const migrations: Record<number, () => void> = {
  1: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)
  },
}

const getDatabaseVersion = (): number => {
  return Number(db.pragma("user_version", { simple: true }))
}

const setDatabaseVersion = (version: number): void => {
  db.pragma(`user_version = ${version}`)
}

const runMigrations = (): void => {
  const currentVersion = getDatabaseVersion()
  if (currentVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than supported version ${CURRENT_SCHEMA_VERSION}`,
    )
  }

  for (let nextVersion = currentVersion + 1; nextVersion <= CURRENT_SCHEMA_VERSION; nextVersion += 1) {
    const migration = migrations[nextVersion]
    if (!migration) {
      throw new Error(`No migration found for version ${nextVersion}`)
    }
    migration()
    setDatabaseVersion(nextVersion)
    console.info(`Applied database migration version ${nextVersion}`)
  }
}

export const initializeDatabase = (): void => {
  try {
    runMigrations()
  } catch (error) {
    console.error("Failed to initialize database", error)
    throw error
  }
}
