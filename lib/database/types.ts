export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          plan: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          plan?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          plan?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: string
          platform_user_id: string
          username: string
          display_name: string | null
          profile_picture: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          account_data: any | null
          is_active: boolean
          last_sync: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          platform_user_id: string
          username: string
          display_name?: string | null
          profile_picture?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          account_data?: any | null
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          platform_user_id?: string
          username?: string
          display_name?: string | null
          profile_picture?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          account_data?: any | null
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          account_id: string
          platform_post_id: string
          post_type: string
          content: string | null
          media_urls: string[] | null
          hashtags: string[] | null
          mentions: string[] | null
          posted_at: string | null
          is_scheduled: boolean
          scheduled_for: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          platform_post_id: string
          post_type: string
          content?: string | null
          media_urls?: string[] | null
          hashtags?: string[] | null
          mentions?: string[] | null
          posted_at?: string | null
          is_scheduled?: boolean
          scheduled_for?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          platform_post_id?: string
          post_type?: string
          content?: string | null
          media_urls?: string[] | null
          hashtags?: string[] | null
          mentions?: string[] | null
          posted_at?: string | null
          is_scheduled?: boolean
          scheduled_for?: string | null
          status?: string
          created_at?: string
        }
      }
      post_metrics: {
        Row: {
          id: string
          post_id: string
          likes: number
          comments: number
          shares: number
          saves: number
          reach: number
          impressions: number
          engagement_rate: number
          clicks: number
          video_views: number
          video_completion_rate: number
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          likes?: number
          comments?: number
          shares?: number
          saves?: number
          reach?: number
          impressions?: number
          engagement_rate?: number
          clicks?: number
          video_views?: number
          video_completion_rate?: number
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          likes?: number
          comments?: number
          shares?: number
          saves?: number
          reach?: number
          impressions?: number
          engagement_rate?: number
          clicks?: number
          video_views?: number
          video_completion_rate?: number
          updated_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          insight_type: string
          insight_data: any
          confidence_score: number | null
          is_active: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          insight_type: string
          insight_data: any
          confidence_score?: number | null
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          insight_type?: string
          insight_data?: any
          confidence_score?: number | null
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
        }
      }
      scheduled_posts: {
        Row: {
          id: string
          account_id: string
          content: string
          media_urls: string[] | null
          hashtags: string[] | null
          scheduled_for: string
          status: string
          ai_optimized: boolean
          optimization_data: any | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          content: string
          media_urls?: string[] | null
          hashtags?: string[] | null
          scheduled_for: string
          status?: string
          ai_optimized?: boolean
          optimization_data?: any | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          content?: string
          media_urls?: string[] | null
          hashtags?: string[] | null
          scheduled_for?: string
          status?: string
          ai_optimized?: boolean
          optimization_data?: any | null
          error_message?: string | null
          created_at?: string
        }
      }
    }
  }
}
