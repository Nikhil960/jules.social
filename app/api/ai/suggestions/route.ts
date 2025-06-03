import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/jwt"
import { DatabaseService } from "@/lib/config/database"
import { geminiAI } from "@/lib/ai/gemini-service"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { platforms, content_type } = await request.json()

    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: "Platforms are required" }, { status: 400 })
    }

    // Get user's recent posts for context
    const recentPosts = DatabaseService.getUserPosts(user.id, 10, 0)

    // Generate content suggestions
    const suggestions = await geminiAI.generateContentSuggestions(
      { subscription_plan: user.subscription_plan },
      recentPosts,
      platforms,
    )

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
