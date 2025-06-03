import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { DatabaseService } from '@/lib/database/database-service'
import { MetricsCalculator } from '@/lib/analytics/metrics-calculator'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] // Bearer token

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and get user
    const user = await AuthService.getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    // Calculate date range
    const endDate = new Date()
    let startDate = new Date()

    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 7) // Default to week
    }

    // Get user's social accounts
    const accounts = await DatabaseService.getSocialAccountsByUserId(user.id)

    // Get account metrics for each account
    const accountMetrics = await Promise.all(
      accounts.map(async (account) => {
        const metrics = await DatabaseService.getAccountMetricsByDateRange(
          account.id,
          startDate.toISOString(),
          endDate.toISOString()
        )
        return {
          account_id: account.id,
          platform: account.platform,
          username: account.username,
          metrics,
        }
      })
    )

    // Get user's posts
    const posts = await DatabaseService.getPostsByUserIdAndDateRange(
      user.id,
      startDate.toISOString(),
      endDate.toISOString()
    )

    // Get post metrics for each post
    const postMetrics = await Promise.all(
      posts.map(async (post) => {
        const metrics = await DatabaseService.getPostMetricsByPostId(post.id)
        return {
          post_id: post.id,
          content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          platforms: await DatabaseService.getPostPlatforms(post.id),
          metrics,
        }
      })
    )

    // Calculate overview metrics
    const totalFollowers = accountMetrics.reduce((sum, account) => {
      const latestMetrics = account.metrics[account.metrics.length - 1]
      return sum + (latestMetrics?.followers || 0)
    }, 0)

    const totalPosts = posts.length

    const averageEngagement = MetricsCalculator.calculateAverageEngagement(
      postMetrics.flatMap(post => post.metrics)
    )

    // Calculate growth metrics
    const followerGrowth = accountMetrics.reduce((growth, account) => {
      if (account.metrics.length < 2) return growth
      
      const oldestMetrics = account.metrics[0]
      const latestMetrics = account.metrics[account.metrics.length - 1]
      
      return growth + (latestMetrics.followers - oldestMetrics.followers)
    }, 0)

    const followerGrowthPercentage = accountMetrics.reduce((total, account) => {
      if (account.metrics.length < 2) return total
      
      const oldestMetrics = account.metrics[0]
      const latestMetrics = account.metrics[account.metrics.length - 1]
      
      if (oldestMetrics.followers === 0) return total
      
      const growthPercent = ((latestMetrics.followers - oldestMetrics.followers) / oldestMetrics.followers) * 100
      return total + growthPercent
    }, 0) / (accountMetrics.length || 1) // Average percentage across accounts

    // Return analytics overview
    return NextResponse.json({
      period,
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      overview: {
        total_followers: totalFollowers,
        total_posts: totalPosts,
        average_engagement: averageEngagement,
        follower_growth: followerGrowth,
        follower_growth_percentage: followerGrowthPercentage,
      },
      accounts: accountMetrics.map(account => ({
        id: account.account_id,
        platform: account.platform,
        username: account.username,
        followers: account.metrics[account.metrics.length - 1]?.followers || 0,
        engagement_rate: MetricsCalculator.calculateEngagementRate(account.metrics),
      })),
      top_posts: postMetrics
        .sort((a, b) => {
          const aEngagement = MetricsCalculator.calculateEngagementScore(a.metrics)
          const bEngagement = MetricsCalculator.calculateEngagementScore(b.metrics)
          return bEngagement - aEngagement
        })
        .slice(0, 5)
        .map(post => ({
          id: post.post_id,
          content: post.content,
          platforms: post.platforms.map(p => p.platform),
          engagement_score: MetricsCalculator.calculateEngagementScore(post.metrics),
        })),
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
