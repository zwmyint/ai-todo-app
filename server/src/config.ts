export interface ServerConfig {
  nodeEnv: string
  port: number
  corsOrigin: string
  dbPath: string
  isProduction: boolean
}

const nodeEnv = process.env.NODE_ENV?.trim() || "development"
const port = Number(process.env.PORT ?? 4000)

if (Number.isNaN(port) || port <= 0) {
  throw new Error("Invalid PORT environment variable")
}

const corsOrigin = process.env.CORS_ORIGIN?.trim() || "http://localhost:5173"
const dbPath = process.env.DB_PATH?.trim() || "./data/todos.db"

export const config: ServerConfig = {
  nodeEnv,
  port,
  corsOrigin,
  dbPath,
  isProduction: nodeEnv === "production",
}
