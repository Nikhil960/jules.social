import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { DatabaseService } from "@/lib/config/database"

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const settings = DatabaseService.getUserSettings(user.id)

    // Default settings
    const defaultSettings = {
      timezone: "UTC",
      notifications_enabled: "true",
      email_reports: "true",
      auto_publish: "false",
      ai_optimization: "true",
      theme: "light",
      language: "en",
    }

    return NextResponse.json({
      success: true,
      settings: { ...defaultSettings, ...settings },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
})

export const PUT = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const settings = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      DatabaseService.setUserSetting(user.id, key, String(value))
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
})
