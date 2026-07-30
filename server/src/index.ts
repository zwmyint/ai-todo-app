import cors from "cors"
import express from "express"
import { todosRouter } from "./routes/todos.js"

const port = Number(process.env.PORT ?? 4000)
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173"

const app = express()

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

app.use("/api/todos", todosRouter)

app.use((_req, res) => {
  res.status(404).json({ error: "route not found" })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: "internal server error" })
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
