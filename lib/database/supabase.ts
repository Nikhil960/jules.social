import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/frontend
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database helper functions
export class DatabaseService {
  static async getUserById(userId: string) {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  }

  static async getUserSocialAccounts(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (error) throw error
    return data
  }

  static async getAccountMetrics(accountId: string, startDate: string, endDate: string) {
    const { data, error } = await supabaseAdmin
      .from("account_metrics")
      .select("*")
      .eq("account_id", accountId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (error) throw error
    return data
  }

  static async getPostsWithMetrics(accountId: string, limit = 20, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select(`
        *,
        post_metrics (*),
        social_accounts (platform, username)
      `)
      .eq("account_id", accountId)
      .order("posted_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  static async createPost(postData: any) {
    const { data, error } = await supabaseAdmin.from("posts").insert(postData).select().single()

    if (error) throw error
    return data
  }

  static async updatePostMetrics(postId: string, metrics: any) {
    const { data, error } = await supabaseAdmin
      .from("post_metrics")
      .upsert({
        post_id: postId,
        ...metrics,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async createAIInsight(insightData: any) {
    const { data, error } = await supabaseAdmin.from("ai_insights").insert(insightData).select().single()

    if (error) throw error
    return data
  }

  static async getAIInsights(userId: string, accountId?: string, insightType?: string) {
    let query = supabaseAdmin.from("ai_insights").select("*").eq("user_id", userId).eq("is_active", true)

    if (accountId) {
      query = query.eq("account_id", accountId)
    }

    if (insightType) {
      query = query.eq("insight_type", insightType)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  static async schedulePost(postData: any) {
    const { data, error } = await supabaseAdmin.from("scheduled_posts").insert(postData).select().single()

    if (error) throw error
    return data
  }

  static async getPendingScheduledPosts() {
    const { data, error } = await supabaseAdmin
      .from("scheduled_posts")
      .select(`
        *,
        social_accounts (platform, access_token, platform_user_id)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())

    if (error) throw error
    return data
  }

  static async updateScheduledPostStatus(postId: string, status: string, errorMessage?: string) {
    const updateData: any = { status }
    if (errorMessage) updateData.error_message = errorMessage

    const { data, error } = await supabaseAdmin
      .from("scheduled_posts")
      .update(updateData)
      .eq("id", postId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
