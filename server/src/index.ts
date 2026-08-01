import cors from "cors"
import express, { type ErrorRequestHandler } from "express"
import { todosRouter } from "./routes/todos.js"
import { config } from "./config.js"
import { initializeDatabase } from "./db.js"

initializeDatabase()

const app = express()

app.use(express.json())

app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 204,
  }),
)

app.use((req, res, next) => {
  const startedAt = Date.now()
  res.on("finish", () => {
    const duration = Date.now() - startedAt
    const messageParts = [req.method, req.originalUrl, res.statusCode, `${duration}ms`]

    if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
      messageParts.push(`body=${JSON.stringify(req.body)}`)
    }

    console.info(messageParts.join(" "))
  })
  next()
})

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

app.use("/api/todos", todosRouter)

app.use((_req, res) => {
  res.status(404).json({ error: "route not found" })
})

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err)

  if (err instanceof Error && err.name === "DatabaseError") {
    return res.status(500).json({ error: "database error" })
  }

  return res.status(500).json({ error: "internal server error" })
}

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`)
})
