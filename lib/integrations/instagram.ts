import type { SocialPlatformIntegration } from "./platform-factory"

interface InstagramAccount {
  id: string
  username: string
  account_type: string
  media_count: number
  followers_count: number
}

interface InstagramPost {
  id: string
  caption: string
  media_type: string
  media_url: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

interface InstagramInsights {
  impressions: number
  reach: number
  profile_views: number
  website_clicks: number
}

export class InstagramIntegration implements SocialPlatformIntegration {
  private readonly baseUrl = "https://graph.instagram.com"
  private readonly apiVersion = "v18.0"

  async connectAccount(authCode: string, userId: number): Promise<any> {
    // Mock Instagram connection
    // In production, this would exchange the auth code for access tokens
    return {
      platform_user_id: `ig_${Math.random().toString(36).substr(2, 9)}`,
      username: `user_${Math.random().toString(36).substr(2, 6)}`,
      display_name: `Instagram User ${Math.floor(Math.random() * 1000)}`,
      profile_picture: `https://picsum.photos/150/150?random=${Math.random()}`,
      access_token: `ig_token_${Math.random().toString(36).substr(2, 20)}`,
      refresh_token: `ig_refresh_${Math.random().toString(36).substr(2, 20)}`,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
      account_data: {
        followers_count: Math.floor(Math.random() * 50000) + 1000,
        following_count: Math.floor(Math.random() * 2000) + 100,
        posts_count: Math.floor(Math.random() * 1000) + 50,
        account_type: "BUSINESS",
        category: "Content Creator",
      },
    }
  }

  async syncAccountData(accountId: string) {
    try {
      const { DatabaseService } = await import("../database/supabase")
      const account = await DatabaseService.getSocialAccountById(accountId)

      if (!account || account.platform !== "instagram") {
        throw new Error("Invalid Instagram account")
      }

      // Get current account metrics
      const accountDetails = await this.getAccountDetails(account.platform_user_id, account.access_token)

      // Get insights for the account
      const insights = await this.getAccountInsights(account.platform_user_id, account.access_token)

      // Update account metrics for today
      const today = new Date().toISOString().split("T")[0]
      const metricsData = {
        account_id: accountId,
        date: today,
        followers_count: accountDetails.followers_count,
        posts_count: accountDetails.media_count,
        reach: insights.reach,
        impressions: insights.impressions,
        profile_views: insights.profile_views,
        website_clicks: insights.website_clicks,
      }

      await DatabaseService.upsertAccountMetrics(metricsData)

      // Update last sync time
      await DatabaseService.updateSocialAccount(accountId, {
        last_sync: new Date().toISOString(),
        account_data: {
          ...account.account_data,
          ...accountDetails,
        },
      })

      return metricsData
    } catch (error) {
      console.error("Error syncing Instagram account data:", error)
      throw error
    }
  }

  async getAccountDetails(accountId: string, accessToken: string): Promise<InstagramAccount> {
    const response = await fetch(
      `${this.baseUrl}/${accountId}?fields=id,username,account_type,media_count,followers_count,profile_picture_url&access_token=${accessToken}`,
    )

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getAccountInsights(accountId: string, accessToken: string): Promise<InstagramInsights> {
    const metrics = ["impressions", "reach", "profile_views", "website_clicks"]
    const period = "day"
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const until = new Date().toISOString().split("T")[0]

    const response = await fetch(
      `${this.baseUrl}/${accountId}/insights?` +
        `metric=${metrics.join(",")}&` +
        `period=${period}&` +
        `since=${since}&` +
        `until=${until}&` +
        `access_token=${accessToken}`,
    )

    if (!response.ok) {
      throw new Error(`Instagram Insights API error: ${response.statusText}`)
    }

    const data = await response.json()
    const insights: InstagramInsights = {
      impressions: 0,
      reach: 0,
      profile_views: 0,
      website_clicks: 0,
    }

    data.data.forEach((metric: any) => {
      if (metric.values && metric.values.length > 0) {
        insights[metric.name as keyof InstagramInsights] = metric.values[0].value || 0
      }
    })

    return insights
  }

  async syncPosts(accountId: string, since?: Date) {
    try {
      const { DatabaseService } = await import("../database/supabase")
      const account = await DatabaseService.getSocialAccountById(accountId)

      if (!account || account.platform !== "instagram") {
        throw new Error("Invalid Instagram account")
      }

      // Get media from Instagram
      let url = `${this.baseUrl}/${account.platform_user_id}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${account.access_token}`

      if (since) {
        url += `&since=${Math.floor(since.getTime() / 1000)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`)
      }

      const data = await response.json()
      const posts = data.data || []

      for (const post of posts) {
        // Check if post already exists
        const existingPost = await DatabaseService.getPostByPlatformId(accountId, post.id)

        if (!existingPost) {
          // Create new post
          const postData = {
            account_id: accountId,
            platform_post_id: post.id,
            post_type: post.media_type.toLowerCase(),
            content: post.caption || "",
            media_urls: [post.media_url],
            posted_at: post.timestamp,
            status: "published",
          }

          const createdPost = await DatabaseService.createPost(postData)

          // Get post insights
          const insights = await this.getPostInsights(post.id, account.access_token)

          // Create post metrics
          await DatabaseService.updatePostMetrics(createdPost.id, {
            likes: insights.like_count || 0,
            comments: insights.comments_count || 0,
            reach: insights.reach || 0,
            impressions: insights.impressions || 0,
            engagement_rate: this.calculateEngagementRate(insights, account.account_data.followers_count),
          })
        }
      }

      return posts.length
    } catch (error) {
      console.error("Error syncing Instagram posts:", error)
      throw error
    }
  }

  async getPostInsights(postId: string, accessToken: string) {
    try {
      const metrics = ["impressions", "reach", "likes", "comments", "saves", "shares"]

      const response = await fetch(
        `${this.baseUrl}/${postId}/insights?metric=${metrics.join(",")}&access_token=${accessToken}`,
      )

      if (!response.ok) {
        // If insights are not available, return basic metrics
        const basicResponse = await fetch(
          `${this.baseUrl}/${postId}?fields=like_count,comments_count&access_token=${accessToken}`,
        )
        return basicResponse.json()
      }

      const data = await response.json()
      const insights: any = {}

      data.data.forEach((metric: any) => {
        insights[metric.name] = metric.values[0]?.value || 0
      })

      return insights
    } catch (error) {
      console.error("Error getting post insights:", error)
      return {}
    }
  }

  async publishPost(accountData: any, postData: any): Promise<any> {
    // Mock Instagram post publishing
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API delay

    // Simulate 95% success rate
    if (Math.random() < 0.95) {
      return {
        platform_post_id: `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        published_at: new Date().toISOString(),
        permalink: `https://instagram.com/p/${Math.random().toString(36).substr(2, 11)}`,
        media_type: postData.media_urls?.length > 0 ? "IMAGE" : "TEXT",
      }
    } else {
      throw new Error("Instagram API rate limit exceeded")
    }
  }

  async getAccountMetrics(accountData: any): Promise<any> {
    // Mock Instagram metrics
    return {
      followers_count: accountData.account_data?.followers_count + Math.floor(Math.random() * 100) - 50,
      following_count: accountData.account_data?.following_count + Math.floor(Math.random() * 20) - 10,
      posts_count: accountData.account_data?.posts_count + Math.floor(Math.random() * 5),
      engagement_rate: Math.random() * 8 + 2, // 2-10%
      reach: Math.floor(Math.random() * 10000) + 1000,
      impressions: Math.floor(Math.random() * 20000) + 2000,
      profile_views: Math.floor(Math.random() * 1000) + 100,
      website_clicks: Math.floor(Math.random() * 200) + 10,
    }
  }

  async getPostMetrics(accountData: any, postId: string): Promise<any> {
    // Mock Instagram post metrics
    return {
      likes: Math.floor(Math.random() * 1000) + 50,
      comments: Math.floor(Math.random() * 100) + 5,
      shares: Math.floor(Math.random() * 50) + 2,
      saves: Math.floor(Math.random() * 200) + 10,
      reach: Math.floor(Math.random() * 5000) + 500,
      impressions: Math.floor(Math.random() * 8000) + 800,
      engagement_rate: Math.random() * 10 + 1,
    }
  }

  async refreshToken(accountData: any): Promise<any> {
    // Mock token refresh
    return {
      access_token: `ig_token_${Math.random().toString(36).substr(2, 20)}`,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  async validateConnection(accountData: any): Promise<boolean> {
    // Mock connection validation
    return Math.random() > 0.1 // 90% success rate
  }

  private async makeRequest(endpoint: string, method = "GET", data?: any, accessToken?: string): Promise<any> {
    const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`
    const headers: any = {
      "Content-Type": "application/json",
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (data && method !== "GET") {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private calculateEngagementRate(insights: any, followersCount: number): number {
    const totalEngagement = (insights.likes || 0) + (insights.comments || 0) + (insights.saves || 0)
    return followersCount > 0 ? (totalEngagement / followersCount) * 100 : 0
  }
}

export const instagramIntegration = new InstagramIntegration()
