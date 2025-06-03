import type { SocialPlatformIntegration } from "./platform-factory"

export class LinkedInIntegration implements SocialPlatformIntegration {
  private readonly baseUrl = "https://api.linkedin.com/v2"

  async connectAccount(authCode: string, userId: number): Promise<any> {
    return {
      platform_user_id: `li_${Math.random().toString(36).substr(2, 9)}`,
      username: `user_${Math.random().toString(36).substr(2, 6)}`,
      display_name: `LinkedIn User ${Math.floor(Math.random() * 1000)}`,
      profile_picture: `https://picsum.photos/150/150?random=${Math.random()}`,
      access_token: `li_token_${Math.random().toString(36).substr(2, 20)}`,
      refresh_token: `li_refresh_${Math.random().toString(36).substr(2, 20)}`,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      account_data: {
        followers_count: Math.floor(Math.random() * 20000) + 500,
        following_count: Math.floor(Math.random() * 3000) + 200,
        posts_count: Math.floor(Math.random() * 500) + 20,
        industry: "Technology",
        company: "Tech Company",
      },
    }
  }

  async publishPost(accountData: any, postData: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 2500))

    if (Math.random() < 0.92) {
      return {
        platform_post_id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        published_at: new Date().toISOString(),
        permalink: `https://linkedin.com/posts/${accountData.username}_${Date.now()}`,
        media_type: postData.media_urls?.length > 0 ? "IMAGE" : "ARTICLE",
      }
    } else {
      throw new Error("LinkedIn publishing failed: Content policy violation")
    }
  }

  async getAccountMetrics(accountData: any): Promise<any> {
    return {
      followers_count: accountData.account_data?.followers_count + Math.floor(Math.random() * 50) - 25,
      following_count: accountData.account_data?.following_count + Math.floor(Math.random() * 20) - 10,
      posts_count: accountData.account_data?.posts_count + Math.floor(Math.random() * 3),
      engagement_rate: Math.random() * 6 + 2, // 2-8%
      reach: Math.floor(Math.random() * 15000) + 1500,
      impressions: Math.floor(Math.random() * 30000) + 3000,
      profile_views: Math.floor(Math.random() * 800) + 80,
      website_clicks: Math.floor(Math.random() * 300) + 30,
    }
  }

  async getPostMetrics(accountData: any, postId: string): Promise<any> {
    return {
      likes: Math.floor(Math.random() * 500) + 25,
      comments: Math.floor(Math.random() * 50) + 3,
      shares: Math.floor(Math.random() * 100) + 5,
      saves: Math.floor(Math.random() * 30) + 2,
      reach: Math.floor(Math.random() * 8000) + 800,
      impressions: Math.floor(Math.random() * 15000) + 1500,
      engagement_rate: Math.random() * 12 + 2,
    }
  }

  async refreshToken(accountData: any): Promise<any> {
    return {
      access_token: `li_token_${Math.random().toString(36).substr(2, 20)}`,
      token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  async validateConnection(accountData: any): Promise<boolean> {
    return Math.random() > 0.08 // 92% success rate
  }
}
