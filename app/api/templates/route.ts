import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { DatabaseService } from "@/lib/config/database"

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let templates = DatabaseService.getUserContentTemplates(user.id)

    if (category) {
      templates = templates.filter((template) => template.category === category)
    }

    return NextResponse.json({
      success: true,
      templates,
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
})

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { name, content, hashtags, category } = await request.json()

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
    }

    const result = DatabaseService.createContentTemplate({
      user_id: user.id,
      name,
      content,
      hashtags: hashtags || [],
      category: category || "general",
    })

    const template = {
      id: result.lastInsertRowid,
      user_id: user.id,
      name,
      content,
      hashtags: hashtags || [],
      category: category || "general",
      usage_count: 0,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
})
