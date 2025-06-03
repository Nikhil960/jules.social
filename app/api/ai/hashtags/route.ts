import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/jwt"
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

    const { content, platform, niche } = await request.json()

    if (!content || !platform) {
      return NextResponse.json({ error: "Content and platform are required" }, { status: 400 })
    }

    const hashtags = await geminiAI.generateHashtagSuggestions(content, platform, niche)

    return NextResponse.json({
      success: true,
      hashtags,
    })
  } catch (error) {
    console.error("Error generating hashtags:", error)
    return NextResponse.json({ error: "Failed to generate hashtags" }, { status: 500 })
  }
}
