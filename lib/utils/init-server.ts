import { initializeDatabase } from "@/lib/config/database"
import { scheduler } from "@/lib/scheduler/cron-jobs"

export function initializeServer() {
  console.log("Initializing PostCraft server...")

  // Initialize database
  initializeDatabase()

  // Start scheduler
  scheduler.startScheduler()

  console.log("PostCraft server initialized successfully!")
}

// Auto-initialize when this module is imported
if (typeof window === "undefined") {
  initializeServer()
}
