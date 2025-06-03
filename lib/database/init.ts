import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Function to initialize the database with schema
export async function initializeDatabase() {
  // Check if we have Supabase credentials
  if (supabaseUrl && supabaseServiceKey) {
    console.log('Using Supabase database')
    return initializeSupabase()
  } else {
    console.log('Using SQLite database for local development')
    return initializeSQLite()
  }
}

async function initializeSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not found')
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Check if we can connect to Supabase
  try {
    const { data, error } = await supabase.from('users').select('count').single()
    if (error) throw error
    console.log('Supabase connection successful')
    return supabase
  } catch (error) {
    console.error('Error connecting to Supabase:', error)
    throw error
  }
}

async function initializeSQLite() {
  try {
    // Dynamically import better-sqlite3 (it's a native module)
    const Database = (await import('better-sqlite3')).default
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const dbPath = path.join(dataDir, 'postcraft.db')
    
    try {
      const db = new Database(dbPath)
      
      // Enable foreign keys
      db.pragma('foreign_keys = ON')

      // Create tables
      createTables(db)

      // Create default admin user if none exists
      createDefaultUser(db)

      console.log('SQLite database initialized successfully')
      return db
    } catch (sqliteError) {
      console.error('Error initializing SQLite database:', sqliteError)
      console.log('Using in-memory database as fallback')
      
      // Create an in-memory database as fallback
      const memoryDb = new Database(':memory:')
      memoryDb.pragma('foreign_keys = ON')
      createTables(memoryDb)
      createDefaultUser(memoryDb)
      
      return memoryDb
    }
  } catch (error) {
    console.error('Error initializing SQLite database:', error)
    throw error
  }
}

function createTables(db: any) {
  // Read schema from SQL file
  const schemaPath = path.join(process.cwd(), 'lib', 'database', 'sqlite-schema.sql')
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8')
    // Split by semicolon to execute each statement separately
    const statements = schema.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        db.exec(statement)
      }
    }
  } else {
    // Fallback to hardcoded schema if file doesn't exist
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
      );

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
      );

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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS post_platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        platform VARCHAR(50) NOT NULL,
        platform_post_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS account_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        date DATE NOT NULL,
        followers_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        posts_count INTEGER DEFAULT 0,
        engagement_rate REAL DEFAULT 0,
        reach INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        profile_views INTEGER DEFAULT 0,
        website_clicks INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE CASCADE,
        UNIQUE(account_id, date)
      );
    `)
  }
}

function createDefaultUser(db: any) {
  // Check if any user exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  
  if (userCount === 0) {
    // Import bcrypt for password hashing
    const bcrypt = require('bcryptjs')
    const passwordHash = bcrypt.hashSync('password123', 10)
    
    // Insert default admin user
    db.prepare(`
      INSERT INTO users (email, password_hash, name, subscription_plan, email_verified)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin@example.com', passwordHash, 'Admin User', 'premium', true)
    
    console.log('Created default admin user: admin@example.com / password123')
  }
}