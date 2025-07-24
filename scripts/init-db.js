import { createTables } from "../lib/db.js"

async function initializeDatabase() {
  try {
    console.log("Initializing database...")
    await createTables()
    console.log("Database initialized successfully!")
  } catch (error) {
    console.error("Failed to initialize database:", error)
    process.exit(1)
  }
}

initializeDatabase()
