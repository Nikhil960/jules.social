import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { DatabaseService } from "@/lib/config/database"
import { Validator } from "@/lib/utils/validation"
import { geminiAI } from "@/lib/ai/gemini-service"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { posts } = await request.json()

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "Posts array is required" }, { status: 400 })
    }

    if (posts.length > 50) {
      return NextResponse.json({ error: "Maximum 50 posts can be scheduled at once" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (let i = 0; i < posts.length; i++) {
      const postData = posts[i]

      try {
        // Validate each post
        const validationErrors = Validator.validateRequest(postData, {
          content: (content) => Validator.validatePostContent(content),
          platforms: (platforms) => Validator.validatePlatforms(platforms),
          scheduled_at: (scheduledAt) => Validator.validateScheduledDate(scheduledAt),
          hashtags: (hashtags) => Validator.validateHashtags(hashtags),
        })

        if (validationErrors.length > 0) {
          errors.push({ index: i, errors: validationErrors })
          continue
        }

        let finalContent = postData.content
        let finalHashtags = postData.hashtags || []
        let optimizationData = null

        // AI optimization if requested
        if (postData.optimize_with_ai) {
          try {
            const optimization = await geminiAI.optimizeContent(
              postData.content,
              postData.platforms,
              postData.post_type,
            )
            finalContent = optimization.optimized_content
            finalHashtags = [...finalHashtags, ...optimization.hashtag_suggestions]
            optimizationData = optimization
          } catch (error) {
            console.warn(`AI optimization failed for post ${i}:`, error)
          }
        }

        // Create post
        const result = DatabaseService.createPost({
          user_id: user.id,
          content: finalContent,
          platform_specific_content: optimizationData?.platform_specific_tips || {},
          media_urls: postData.media_urls || [],
          hashtags: finalHashtags,
          mentions: postData.mentions || [],
          scheduled_at: postData.scheduled_at,
          status: postData.scheduled_at ? "scheduled" : "draft",
          post_type: postData.post_type || "post",
          platforms: postData.platforms,
        })

        results.push({
          index: i,
          post_id: result.lastInsertRowid,
          status: "success",
          optimization: optimizationData,
        })
      } catch (error) {
        errors.push({
          index: i,
          errors: [{ field: "general", message: error instanceof Error ? error.message : "Unknown error" }],
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: posts.length,
        successful: results.length,
        failed: errors.length,
      },
    })
  } catch (error) {
    console.error("Error bulk scheduling posts:", error)
    return NextResponse.json({ error: "Failed to bulk schedule posts" }, { status: 500 })
  }
})
