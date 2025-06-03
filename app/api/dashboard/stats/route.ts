import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { DatabaseService } from "@/lib/config/database"

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "30d"

    // Get user's social accounts
    const accounts = DatabaseService.getUserSocialAccounts(user.id)

    // Get user's posts
    const posts = DatabaseService.getUserPosts(user.id, 1000, 0)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    const days = Number.parseInt(timeframe.replace("d", ""))
    startDate.setDate(endDate.getDate() - days)

    // Calculate stats
    const stats = {
      total_accounts: accounts.length,
      total_posts: posts.length,
      scheduled_posts: posts.filter((p) => p.status === "scheduled").length,
      published_posts: posts.filter((p) => p.status === "published").length,
      draft_posts: posts.filter((p) => p.status === "draft").length,
      total_followers: accounts.reduce((sum, acc) => sum + (acc.account_data?.followers_count || 0), 0),
      platforms: accounts.map((acc) => acc.platform),
      recent_activity: posts
        .filter((p) => new Date(p.created_at) >= startDate)
        .slice(0, 10)
        .map((p) => ({
          id: p.id,
          content: p.content.substring(0, 100),
          status: p.status,
          platforms: p.platforms,
          created_at: p.created_at,
          scheduled_at: p.scheduled_at,
        })),
      engagement_summary: {
        avg_engagement_rate: Math.random() * 5 + 2, // Mock data
        total_likes: Math.floor(Math.random() * 10000) + 1000,
        total_comments: Math.floor(Math.random() * 1000) + 100,
        total_shares: Math.floor(Math.random() * 500) + 50,
      },
      growth_metrics: accounts.map((acc) => ({
        platform: acc.platform,
        username: acc.username,
        followers: acc.account_data?.followers_count || 0,
        growth_rate: Math.random() * 10 - 5, // -5% to +5%
      })),
    }

    return NextResponse.json({
      success: true,
      stats,
      timeframe,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
})
