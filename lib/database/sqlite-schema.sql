-- Users and Authentication
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

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_reports BOOLEAN DEFAULT TRUE,
  theme VARCHAR(50) DEFAULT 'light',
  currency VARCHAR(50) DEFAULT 'USD',
  report_frequency VARCHAR(50) DEFAULT 'weekly',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Social media accounts
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
  account_data TEXT, -- JSON data stored as text
  is_active BOOLEAN DEFAULT TRUE,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(platform, platform_user_id)
);

-- Account metrics (daily aggregates)
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

-- Posts and content
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  platform_specific_content TEXT, -- JSON data stored as text
  media_urls TEXT, -- JSON array stored as text
  hashtags TEXT, -- JSON array stored as text
  mentions TEXT, -- JSON array stored as text
  scheduled_at DATETIME,
  published_at DATETIME,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Post platforms (for cross-posting)
CREATE TABLE IF NOT EXISTS post_platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  platform VARCHAR(50) NOT NULL,
  platform_post_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'published', 'failed'
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Post performance metrics
CREATE TABLE IF NOT EXISTS post_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  platform VARCHAR(50) NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  video_completion_rate REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Comments and interactions
CREATE TABLE IF NOT EXISTS post_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  platform VARCHAR(50) NOT NULL,
  platform_comment_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255),
  author_username VARCHAR(255),
  author_profile_pic TEXT,
  content TEXT,
  posted_at DATETIME,
  sentiment VARCHAR(50), -- 'positive', 'neutral', 'negative'
  is_reply BOOLEAN DEFAULT FALSE,
  parent_comment_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(platform, platform_comment_id)
);

-- Content templates
CREATE TABLE IF NOT EXISTS content_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  hashtags TEXT, -- JSON array stored as text
  category VARCHAR(100),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Media library
CREATE TABLE IF NOT EXISTS media_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio'
  file_size INTEGER,
  dimensions VARCHAR(100), -- e.g. "1920x1080"
  duration INTEGER, -- in seconds, for video/audio
  thumbnail_path TEXT,
  tags TEXT, -- JSON array stored as text
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Scheduled jobs
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_type VARCHAR(50) NOT NULL, -- 'post_publish', 'account_sync', 'analytics_report'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  data TEXT, -- JSON data stored as text
  scheduled_for DATETIME NOT NULL,
  last_run DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI generated content
CREATE TABLE IF NOT EXISTS ai_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  content_type VARCHAR(50), -- 'post', 'caption', 'hashtags', 'reply'
  platform VARCHAR(50),
  is_saved BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics insights
CREATE TABLE IF NOT EXISTS analytics_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  insight_type VARCHAR(50) NOT NULL, -- 'growth', 'engagement', 'content', 'timing'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  recommendation TEXT,
  confidence REAL DEFAULT 0,
  data_points TEXT, -- JSON data stored as text
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);