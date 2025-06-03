import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"

let db: Database.Database | null = null

export function initializeDatabase() {
  if (db) return db

  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, "postcraft.db")
  db = new Database(dbPath)

  // Enable foreign keys
  db.pragma("foreign_keys = ON")

  // Create tables
  createTables()

  // Create default admin user if none exists
  createDefaultUser()

  console.log("Database initialized successfully")
  return db
}

function createTables() {
  if (!db) throw new Error("Database not initialized")

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      subscription_plan VARCHAR(50) DEFAULT 'free',
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expires DATETIME,
      timezone VARCHAR(50) DEFAULT 'UTC',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Social accounts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS social_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      platform VARCHAR(50) NOT NULL,
      platform_user_id VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      display_name VARCHAR(255),
      profile_picture TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at DATETIME,
      account_data TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      last_sync DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(platform, platform_user_id)
    )
  `)

  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      platform_specific_content TEXT,
      media_urls TEXT,
      hashtags TEXT,
      mentions TEXT,
      scheduled_at DATETIME,
      published_at DATETIME,
      status VARCHAR(50) DEFAULT 'draft',
      post_type VARCHAR(50) DEFAULT 'post',
      campaign_id INTEGER,
      platforms TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Post analytics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      platform VARCHAR(50) NOT NULL,
      platform_post_id VARCHAR(255),
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      reach INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      engagement_rate DECIMAL(5,2) DEFAULT 0,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `)

  // Account metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS account_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      date DATE NOT NULL,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      posts_count INTEGER DEFAULT 0,
      engagement_rate DECIMAL(5,2) DEFAULT 0,
      reach INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      profile_views INTEGER DEFAULT 0,
      website_clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE CASCADE,
      UNIQUE(account_id, date)
    )
  `)

  // Media library table
  db.exec(`
    CREATE TABLE IF NOT EXISTS media_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type VARCHAR(100),
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Content templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      hashtags TEXT,
      category VARCHAR(100),
      is_public BOOLEAN DEFAULT FALSE,
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Campaigns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status VARCHAR(50) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      account_id INTEGER NOT NULL,
      platform_comment_id VARCHAR(255) NOT NULL,
      author_username VARCHAR(255),
      author_name VARCHAR(255),
      content TEXT,
      sentiment_score DECIMAL(3,2),
      is_reply BOOLEAN DEFAULT FALSE,
      parent_comment_id INTEGER,
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id),
      UNIQUE(account_id, platform_comment_id)
    )
  `)

  // Scheduled jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_type VARCHAR(100) NOT NULL,
      job_data TEXT,
      scheduled_for DATETIME NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, setting_key)
    )
  `)

  // AI insights table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      account_id INTEGER,
      insight_type VARCHAR(100) NOT NULL,
      insight_data TEXT NOT NULL,
      confidence_score DECIMAL(3,2),
      is_active BOOLEAN DEFAULT TRUE,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE CASCADE
    )
  `)

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
    CREATE INDEX IF NOT EXISTS idx_account_metrics_account_date ON account_metrics(account_id, date);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_scheduled_for ON scheduled_jobs(scheduled_for);
    CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
  `)
}

function createDefaultUser() {
  if (!db) throw new Error("Database not initialized")

  const existingUser = db.prepare("SELECT id FROM users LIMIT 1").get()
  if (existingUser) return

  const hashedPassword = bcrypt.hashSync("admin123", 10)
  db.prepare(`
    INSERT INTO users (email, password_hash, name, subscription_plan)
    VALUES (?, ?, ?, ?)
  `).run("admin@postcraft.com", hashedPassword, "Admin User", "premium")

  console.log("Default admin user created: admin@postcraft.com / admin123")
}

export class DatabaseService {
  static getDb() {
    if (!db) {
      initializeDatabase()
    }
    return db!
  }

  // User operations
  static createUser(email: string, passwordHash: string, name?: string) {
    const db = this.getDb()
    return db.prepare(`INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`).run(email, passwordHash, name)
  }

  static getUserByEmail(email: string) {
    const db = this.getDb()
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email)
  }

  static getUserById(id: number) {
    const db = this.getDb()
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id)
  }

  // Social accounts operations
  static createSocialAccount(accountData: any) {
    const db = this.getDb()
    return db
      .prepare(`
        INSERT INTO social_accounts (
          user_id, platform, platform_user_id, username, display_name,
          profile_picture, access_token, refresh_token, token_expires_at, account_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        accountData.user_id,
        accountData.platform,
        accountData.platform_user_id,
        accountData.username,
        accountData.display_name,
        accountData.profile_picture,
        accountData.access_token,
        accountData.refresh_token,
        accountData.token_expires_at,
        JSON.stringify(accountData.account_data),
      )
  }

  static getUserSocialAccounts(userId: number) {
    const db = this.getDb()
    const accounts = db.prepare("SELECT * FROM social_accounts WHERE user_id = ? AND is_active = TRUE").all(userId)

    return accounts.map((account: any) => ({
      ...account,
      account_data: account.account_data ? JSON.parse(account.account_data) : null,
    }))
  }

  static getSocialAccountById(accountId: number) {
    const db = this.getDb()
    const account = db.prepare("SELECT * FROM social_accounts WHERE id = ?").get(accountId)
    if (account) {
      account.account_data = account.account_data ? JSON.parse(account.account_data) : null
    }
    return account
  }

  // Posts operations
  static createPost(postData: any) {
    const db = this.getDb()
    return db
      .prepare(`
        INSERT INTO posts (
          user_id, content, platform_specific_content, media_urls, hashtags,
          mentions, scheduled_at, status, post_type, platforms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        postData.user_id,
        postData.content,
        JSON.stringify(postData.platform_specific_content || {}),
        JSON.stringify(postData.media_urls || []),
        JSON.stringify(postData.hashtags || []),
        JSON.stringify(postData.mentions || []),
        postData.scheduled_at,
        postData.status,
        postData.post_type,
        JSON.stringify(postData.platforms || []),
      )
  }

  static getUserPosts(userId: number, limit = 20, offset = 0) {
    const db = this.getDb()
    const posts = db
      .prepare(`
        SELECT * FROM posts 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .all(userId, limit, offset)

    return posts.map((post: any) => ({
      ...post,
      platform_specific_content: post.platform_specific_content ? JSON.parse(post.platform_specific_content) : {},
      media_urls: post.media_urls ? JSON.parse(post.media_urls) : [],
      hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
      mentions: post.mentions ? JSON.parse(post.mentions) : [],
      platforms: post.platforms ? JSON.parse(post.platforms) : [],
    }))
  }

  static getScheduledPosts() {
    const db = this.getDb()
    const now = new Date().toISOString()
    const posts = db
      .prepare(`
        SELECT * FROM posts 
        WHERE status = 'scheduled' 
        AND scheduled_at <= ? 
        ORDER BY scheduled_at ASC
      `)
      .all(now)

    return posts.map((post: any) => ({
      ...post,
      platform_specific_content: post.platform_specific_content ? JSON.parse(post.platform_specific_content) : {},
      media_urls: post.media_urls ? JSON.parse(post.media_urls) : [],
      hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
      mentions: post.mentions ? JSON.parse(post.mentions) : [],
      platforms: post.platforms ? JSON.parse(post.platforms) : [],
    }))
  }

  static updatePostStatus(postId: number, status: string, publishedAt?: string, errorMessage?: string) {
    const db = this.getDb()
    const updateData: any = { status }
    if (publishedAt) updateData.published_at = publishedAt
    if (errorMessage) updateData.error_message = errorMessage

    const setClause = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(updateData)

    return db.prepare(`UPDATE posts SET ${setClause} WHERE id = ?`).run(...values, postId)
  }

  // Account metrics operations
  static createAccountMetrics(metricsData: any) {
    const db = this.getDb()
    return db
      .prepare(`
        INSERT OR REPLACE INTO account_metrics (
          account_id, date, followers_count, following_count, posts_count,
          engagement_rate, reach, impressions, profile_views, website_clicks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        metricsData.account_id,
        metricsData.date,
        metricsData.followers_count,
        metricsData.following_count,
        metricsData.posts_count,
        metricsData.engagement_rate,
        metricsData.reach,
        metricsData.impressions,
        metricsData.profile_views,
        metricsData.website_clicks,
      )
  }

  static getAccountMetrics(accountId: number, startDate: string, endDate: string) {
    const db = this.getDb()
    return db
      .prepare(`
        SELECT * FROM account_metrics 
        WHERE account_id = ? AND date BETWEEN ? AND ?
        ORDER BY date ASC
      `)
      .all(accountId, startDate, endDate)
  }

  // AI insights operations
  static createAIInsight(insightData: any) {
    const db = this.getDb()
    return db
      .prepare(`
        INSERT INTO ai_insights (
          user_id, account_id, insight_type, insight_data, confidence_score, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        insightData.user_id,
        insightData.account_id,
        insightData.insight_type,
        JSON.stringify(insightData.insight_data),
        insightData.confidence_score,
        insightData.expires_at,
      )
  }

  static getAIInsights(userId: number, accountId?: number, insightType?: string) {
    const db = this.getDb()
    let query = "SELECT * FROM ai_insights WHERE user_id = ? AND is_active = TRUE"
    const params: any[] = [userId]

    if (accountId) {
      query += " AND account_id = ?"
      params.push(accountId)
    }

    if (insightType) {
      query += " AND insight_type = ?"
      params.push(insightType)
    }

    query += " ORDER BY created_at DESC"

    const insights = db.prepare(query).all(...params)
    return insights.map((insight: any) => ({
      ...insight,
      insight_data: JSON.parse(insight.insight_data),
    }))
  }

  // Content templates operations
  static createContentTemplate(templateData: any) {
    const db = this.getDb()
    return db
      .prepare(`
        INSERT INTO content_templates (user_id, name, content, hashtags, category)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        templateData.user_id,
        templateData.name,
        templateData.content,
        JSON.stringify(templateData.hashtags || []),
        templateData.category,
      )
  }

  static getUserContentTemplates(userId: number) {
    const db = this.getDb()
    const templates = db
      .prepare("SELECT * FROM content_templates WHERE user_id = ? OR is_public = TRUE ORDER BY usage_count DESC")
      .all(userId)

    return templates.map((template: any) => ({
      ...template,
      hashtags: template.hashtags ? JSON.parse(template.hashtags) : [],
    }))
  }

  // Media library operations
  static createMediaFile(mediaData: any) {
    const db = this.getDb()
    return db
      .prepare(`
        INSERT INTO media_library (
          user_id, filename, original_name, file_path, file_size, mime_type, width, height, alt_text, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        mediaData.user_id,
        mediaData.filename,
        mediaData.original_name,
        mediaData.file_path,
        mediaData.file_size,
        mediaData.mime_type,
        mediaData.width,
        mediaData.height,
        mediaData.alt_text,
        JSON.stringify(mediaData.tags || []),
      )
  }

  static getUserMediaFiles(userId: number, limit = 50, offset = 0) {
    const db = this.getDb()
    const files = db
      .prepare(`
        SELECT * FROM media_library 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .all(userId, limit, offset)

    return files.map((file: any) => ({
      ...file,
      tags: file.tags ? JSON.parse(file.tags) : [],
    }))
  }

  // User settings operations
  static getUserSetting(userId: number, settingKey: string) {
    const db = this.getDb()
    const setting = db
      .prepare("SELECT setting_value FROM user_settings WHERE user_id = ? AND setting_key = ?")
      .get(userId, settingKey)
    return setting?.setting_value
  }

  static setUserSetting(userId: number, settingKey: string, settingValue: string) {
    const db = this.getDb()
    return db
      .prepare(`
        INSERT OR REPLACE INTO user_settings (user_id, setting_key, setting_value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `)
      .run(userId, settingKey, settingValue)
  }

  static getUserSettings(userId: number) {
    const db = this.getDb()
    const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").all(userId)
    const settingsObj: any = {}
    settings.forEach((setting: any) => {
      settingsObj[setting.setting_key] = setting.setting_value
    })
    return settingsObj
  }
}
