import { config } from "./config.js"
import { initializeDatabase } from "./db.js"
import { app } from "./app.js"

initializeDatabase()

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`)
})
