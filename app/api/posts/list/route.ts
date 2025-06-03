import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/jwt"
import { DatabaseService } from "@/lib/config/database"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")

    let posts = DatabaseService.getUserPosts(user.id, limit, offset)

    // Filter by status if provided
    if (status) {
      posts = posts.filter((post) => post.status === status)
    }

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        limit,
        offset,
        has_more: posts.length === limit,
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
