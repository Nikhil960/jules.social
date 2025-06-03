import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { initializeDatabase } from './init'

// Type definitions for database operations
export interface User {
  id: number | string
  email: string
  name?: string | null
  avatar_url?: string | null
  subscription_plan: string
  timezone: string
  created_at: string
  updated_at?: string
}

export interface SocialAccount {
  id: number | string
  user_id: number | string
  platform: string
  platform_user_id: string
  username: string
  display_name?: string | null
  profile_picture?: string | null
  access_token?: string | null
  refresh_token?: string | null
  token_expires_at?: string | null
  account_data?: any
  is_active: boolean
  last_sync?: string | null
  created_at: string
}

export interface Post {
  id: number | string
  user_id: number | string
  content: string
  platform_specific_content?: any
  media_urls?: string[]
  hashtags?: string[]
  mentions?: string[]
  scheduled_at?: string | null
  published_at?: string | null
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  created_at: string
}

export interface AccountMetrics {
  id: number | string
  account_id: number | string
  date: string
  followers_count: number
  following_count: number
  posts_count: number
  engagement_rate: number
  reach: number
  impressions: number
  profile_views: number
  website_clicks: number
  created_at: string
}

// Database service class
export class DatabaseService {
  private static instance: any
  private static dbType: 'supabase' | 'sqlite' = 'sqlite'

  // Initialize the database connection
  static async init() {
    if (this.instance) return this.instance

    this.instance = await initializeDatabase()
    
    // Determine which type of database we're using
    if (this.instance.from) {
      this.dbType = 'supabase'
    } else {
      this.dbType = 'sqlite'
    }

    return this.instance
  }

  // Get database instance
  static async getDb() {
    if (!this.instance) {
      await this.init()
    }
    return this.instance
  }

  // User operations
  static async getUserById(userId: number | string): Promise<User | null> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db.from('users').select('*').eq('id', userId).single()
      if (error) throw error
      return data
    } else {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db.from('users').select('*').eq('email', email).single()
      if (error && error.code !== 'PGRST116') return null // PGRST116 is "No rows returned"
      return data
    } else {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    }
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db.from('users').insert(userData).select().single()
      if (error) throw error
      return data
    } else {
      const columns = Object.keys(userData).join(', ')
      const placeholders = Object.keys(userData).map(() => '?').join(', ')
      const values = Object.values(userData)
      
      const result = db.prepare(
        `INSERT INTO users (${columns}) VALUES (${placeholders}) RETURNING *`
      ).get(...values)
      
      if (!result) {
        const id = db.prepare('SELECT last_insert_rowid() as id').get().id
        return this.getUserById(id) as Promise<User>
      }
      
      return result
    }
  }

  static async updateUser(userId: number | string, userData: Partial<User>): Promise<User> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const setClause = Object.keys(userData)
        .map(key => `${key} = ?`)
        .join(', ')
      
      const values = [...Object.values(userData), userId]
      
      db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values)
      return this.getUserById(userId) as Promise<User>
    }
  }

  // Social account operations
  static async getUserSocialAccounts(userId: number | string): Promise<SocialAccount[]> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
      
      if (error) throw error
      return data
    } else {
      return db
        .prepare('SELECT * FROM social_accounts WHERE user_id = ? AND is_active = 1')
        .all(userId)
    }
  }

  static async getSocialAccountById(accountId: number | string): Promise<SocialAccount | null> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('social_accounts')
        .select('*')
        .eq('id', accountId)
        .single()
      
      if (error) return null
      return data
    } else {
      return db.prepare('SELECT * FROM social_accounts WHERE id = ?').get(accountId)
    }
  }

  static async createSocialAccount(accountData: Partial<SocialAccount>): Promise<SocialAccount> {
    const db = await this.getDb()
    
    // Convert account_data to string if it's an object (for SQLite)
    if (this.dbType === 'sqlite' && accountData.account_data && typeof accountData.account_data === 'object') {
      accountData.account_data = JSON.stringify(accountData.account_data)
    }
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('social_accounts')
        .insert(accountData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const columns = Object.keys(accountData).join(', ')
      const placeholders = Object.keys(accountData).map(() => '?').join(', ')
      const values = Object.values(accountData)
      
      const result = db.prepare(
        `INSERT INTO social_accounts (${columns}) VALUES (${placeholders}) RETURNING *`
      ).get(...values)
      
      if (!result) {
        const id = db.prepare('SELECT last_insert_rowid() as id').get().id
        return this.getSocialAccountById(id) as Promise<SocialAccount>
      }
      
      return result
    }
  }

  // Post operations
  static async getUserPosts(
    userId: number | string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Post[]> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      return data
    } else {
      return db
        .prepare(
          'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        )
        .all(userId, limit, offset)
        .map((post: any) => {
          // Parse JSON strings to objects/arrays
          if (post.media_urls && typeof post.media_urls === 'string') {
            try { post.media_urls = JSON.parse(post.media_urls) } catch (e) { post.media_urls = [] }
          }
          if (post.hashtags && typeof post.hashtags === 'string') {
            try { post.hashtags = JSON.parse(post.hashtags) } catch (e) { post.hashtags = [] }
          }
          if (post.mentions && typeof post.mentions === 'string') {
            try { post.mentions = JSON.parse(post.mentions) } catch (e) { post.mentions = [] }
          }
          if (post.platform_specific_content && typeof post.platform_specific_content === 'string') {
            try { post.platform_specific_content = JSON.parse(post.platform_specific_content) } 
            catch (e) { post.platform_specific_content = {} }
          }
          return post
        })
    }
  }

  static async createPost(postData: Partial<Post>): Promise<Post> {
    const db = await this.getDb()
    
    // Convert arrays and objects to strings for SQLite
    if (this.dbType === 'sqlite') {
      if (postData.media_urls && Array.isArray(postData.media_urls)) {
        postData.media_urls = JSON.stringify(postData.media_urls) as any
      }
      if (postData.hashtags && Array.isArray(postData.hashtags)) {
        postData.hashtags = JSON.stringify(postData.hashtags) as any
      }
      if (postData.mentions && Array.isArray(postData.mentions)) {
        postData.mentions = JSON.stringify(postData.mentions) as any
      }
      if (postData.platform_specific_content && typeof postData.platform_specific_content === 'object') {
        postData.platform_specific_content = JSON.stringify(postData.platform_specific_content) as any
      }
    }
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('posts')
        .insert(postData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const columns = Object.keys(postData).join(', ')
      const placeholders = Object.keys(postData).map(() => '?').join(', ')
      const values = Object.values(postData)
      
      const result = db.prepare(
        `INSERT INTO posts (${columns}) VALUES (${placeholders}) RETURNING *`
      ).get(...values)
      
      if (!result) {
        const id = db.prepare('SELECT last_insert_rowid() as id').get().id
        return this.getPostById(id) as Promise<Post>
      }
      
      return result
    }
  }

  static async getPostById(postId: number | string): Promise<Post | null> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()
      
      if (error) return null
      return data
    } else {
      const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId)
      
      if (!post) return null
      
      // Parse JSON strings to objects/arrays
      if (post.media_urls && typeof post.media_urls === 'string') {
        try { post.media_urls = JSON.parse(post.media_urls) } catch (e) { post.media_urls = [] }
      }
      if (post.hashtags && typeof post.hashtags === 'string') {
        try { post.hashtags = JSON.parse(post.hashtags) } catch (e) { post.hashtags = [] }
      }
      if (post.mentions && typeof post.mentions === 'string') {
        try { post.mentions = JSON.parse(post.mentions) } catch (e) { post.mentions = [] }
      }
      if (post.platform_specific_content && typeof post.platform_specific_content === 'string') {
        try { post.platform_specific_content = JSON.parse(post.platform_specific_content) } 
        catch (e) { post.platform_specific_content = {} }
      }
      
      return post
    }
  }

  // Account metrics operations
  static async getAccountMetrics(
    accountId: number | string,
    startDate: string,
    endDate: string
  ): Promise<AccountMetrics[]> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      const { data, error } = await db
        .from('account_metrics')
        .select('*')
        .eq('account_id', accountId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
      
      if (error) throw error
      return data
    } else {
      return db
        .prepare(
          'SELECT * FROM account_metrics WHERE account_id = ? AND date >= ? AND date <= ? ORDER BY date ASC'
        )
        .all(accountId, startDate, endDate)
    }
  }

  static async saveAccountMetrics(metricsData: Partial<AccountMetrics>): Promise<AccountMetrics> {
    const db = await this.getDb()
    
    if (this.dbType === 'supabase') {
      // Check if metrics for this account and date already exist
      const { data: existing } = await db
        .from('account_metrics')
        .select('id')
        .eq('account_id', metricsData.account_id)
        .eq('date', metricsData.date)
        .single()
      
      if (existing) {
        // Update existing metrics
        const { data, error } = await db
          .from('account_metrics')
          .update(metricsData)
          .eq('id', existing.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        // Insert new metrics
        const { data, error } = await db
          .from('account_metrics')
          .insert(metricsData)
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    } else {
      // Check if metrics for this account and date already exist
      const existing = db
        .prepare('SELECT id FROM account_metrics WHERE account_id = ? AND date = ?')
        .get(metricsData.account_id, metricsData.date)
      
      if (existing) {
        // Update existing metrics
        const setClause = Object.keys(metricsData)
          .filter(key => key !== 'account_id' && key !== 'date')
          .map(key => `${key} = ?`)
          .join(', ')
        
        const values = [
          ...Object.entries(metricsData)
            .filter(([key]) => key !== 'account_id' && key !== 'date')
            .map(([_, value]) => value),
          existing.id
        ]
        
        db.prepare(`UPDATE account_metrics SET ${setClause} WHERE id = ?`).run(...values)
        return db.prepare('SELECT * FROM account_metrics WHERE id = ?').get(existing.id)
      } else {
        // Insert new metrics
        const columns = Object.keys(metricsData).join(', ')
        const placeholders = Object.keys(metricsData).map(() => '?').join(', ')
        const values = Object.values(metricsData)
        
        const result = db.prepare(
          `INSERT INTO account_metrics (${columns}) VALUES (${placeholders}) RETURNING *`
        ).get(...values)
        
        if (!result) {
          const id = db.prepare('SELECT last_insert_rowid() as id').get().id
          return db.prepare('SELECT * FROM account_metrics WHERE id = ?').get(id)
        }
        
        return result
      }
    }
  }
}