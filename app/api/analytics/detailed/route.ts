import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { DatabaseService } from "@/lib/config/database"
import { MetricsCalculator } from "@/lib/analytics/metrics-calculator"

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("account_id")
    const timeframe = searchParams.get("timeframe") || "30d"
    const metricType = searchParams.get("metric_type") || "all"

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    // Verify account belongs to user
    const account = DatabaseService.getSocialAccountById(Number(accountId))
    if (!account || account.user_id !== user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    const days = Number.parseInt(timeframe.replace("d", ""))
    startDate.setDate(endDate.getDate() - days)

    // Get account metrics
    const accountMetrics = DatabaseService.getAccountMetrics(
      Number(accountId),
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    )

    // Get posts with analytics
    const posts = DatabaseService.getUserPosts(user.id, 100, 0).filter((post) =>
      post.platforms.includes(account.platform),
    )

    // Calculate detailed metrics
    const detailedMetrics = accountMetrics.map((metric) => {
      const calculatedMetrics = MetricsCalculator.calculateAllMetrics({
        likes: 0, // These would come from post analytics
        comments: 0,
        shares: 0,
        saves: 0,
        reach: metric.reach,
        impressions: metric.impressions,
        clicks: metric.website_clicks,
        followers: metric.followers_count,
      })

      return {
        date: metric.date,
        ...calculatedMetrics,
        benchmark_comparison: MetricsCalculator.getBenchmarkComparison(calculatedMetrics, account.platform),
      }
    })

    // Generate insights
    const insights = MetricsCalculator.generateInsights(detailedMetrics, account.platform)

    // Get optimal posting times
    const optimalTimes = MetricsCalculator.getOptimalPostingTimes(accountMetrics)

    // Calculate trends
    const trends = {
      followers: calculateTrend(accountMetrics.map((m) => m.followers_count)),
      engagement: calculateTrend(accountMetrics.map((m) => m.engagement_rate)),
      reach: calculateTrend(accountMetrics.map((m) => m.reach)),
      impressions: calculateTrend(accountMetrics.map((m) => m.impressions)),
    }

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        username: account.username,
      },
      timeframe,
      metrics: detailedMetrics,
      insights,
      optimal_times: optimalTimes,
      trends,
      posts_performance: posts.slice(0, 10).map((post) => ({
        id: post.id,
        content: post.content.substring(0, 100),
        created_at: post.created_at,
        platforms: post.platforms,
        // Mock performance data
        performance: {
          likes: Math.floor(Math.random() * 1000) + 50,
          comments: Math.floor(Math.random() * 100) + 5,
          shares: Math.floor(Math.random() * 50) + 2,
          engagement_rate: Math.random() * 10 + 1,
        },
      })),
    })
  } catch (error) {
    console.error("Error fetching detailed analytics:", error)
    return NextResponse.json({ error: "Failed to fetch detailed analytics" }, { status: 500 })
  }
})

function calculateTrend(values: number[]): { direction: "up" | "down" | "stable"; percentage: number } {
  if (values.length < 2) return { direction: "stable", percentage: 0 }

  const first = values[0]
  const last = values[values.length - 1]

  if (first === 0) return { direction: "stable", percentage: 0 }

  const percentage = ((last - first) / first) * 100

  return {
    direction: percentage > 1 ? "up" : percentage < -1 ? "down" : "stable",
    percentage: Math.abs(percentage),
  }
}
