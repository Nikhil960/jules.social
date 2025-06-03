import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DatabaseService } from "@/lib/database/supabase"
import { aiServices } from "@/lib/ai/gemini-services"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { account_id, content, hashtags, post_type = "post", scheduled_for } = await request.json()

    if (!account_id || !content) {
      return NextResponse.json({ error: "Account ID and content are required" }, { status: 400 })
    }

    // Verify account belongs to user
    const account = await DatabaseService.getSocialAccountById(account_id)
    if (!account || account.user_id !== user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Get historical posts for prediction context
    const historicalPosts = await DatabaseService.getPostsWithMetrics(account_id, 20, 0)

    // Prepare post data for prediction
    const postData = {
      content,
      platform: account.platform,
      hashtags,
      post_type,
      scheduled_for,
    }

    // Get AI prediction
    const prediction = await aiServices.predictPostPerformance(postData, historicalPosts)

    // Store prediction in database if this is for an actual post
    if (scheduled_for) {
      await DatabaseService.createAIInsight({
        user_id: user.id,
        account_id,
        insight_type: "performance_prediction",
        insight_data: prediction,
        confidence_score: prediction.confidence_score,
      })
    }

    return NextResponse.json({
      success: true,
      prediction,
    })
  } catch (error) {
    console.error("Error predicting post performance:", error)
    return NextResponse.json({ error: "Failed to predict post performance" }, { status: 500 })
  }
}
