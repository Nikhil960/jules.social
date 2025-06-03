-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    avatar_url TEXT,
    plan VARCHAR DEFAULT 'free',
    timezone VARCHAR DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    email_reports BOOLEAN DEFAULT true,
    theme VARCHAR DEFAULT 'light',
    currency VARCHAR DEFAULT 'USD',
    report_frequency VARCHAR DEFAULT 'weekly',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Social media accounts
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform ENUM ('instagram', 'facebook', 'x', 'linkedin', 'tiktok', 'youtube') NOT NULL,
    platform_user_id VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    display_name VARCHAR,
    profile_picture TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    account_data JSONB, -- Store platform-specific data
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(platform, platform_user_id)
);

-- Account metrics (daily aggregates)
CREATE TABLE account_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, date)
);

-- Posts and content
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    platform_post_id VARCHAR NOT NULL,
    post_type VARCHAR NOT NULL, -- 'post', 'story', 'reel', 'video', 'carousel'
    content TEXT,
    media_urls TEXT[], -- Array of media URLs
    hashtags TEXT[],
    mentions TEXT[],
    posted_at TIMESTAMP,
    is_scheduled BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP,
    status VARCHAR DEFAULT 'published', -- 'draft', 'scheduled', 'published', 'failed'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, platform_post_id)
);

-- Post performance metrics
CREATE TABLE post_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    video_completion_rate DECIMAL(5,4) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments and interactions
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    platform_comment_id VARCHAR NOT NULL,
    author_username VARCHAR,
    author_name VARCHAR,
    content TEXT,
    sentiment_score DECIMAL(3,2), -- -1 to 1
    is_reply BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES post_comments(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, platform_comment_id)
);

-- AI insights and predictions
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    insight_type VARCHAR NOT NULL, -- 'performance_prediction', 'optimal_timing', 'content_suggestion', 'trend_analysis'
    insight_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Post performance predictions
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    predicted_likes INTEGER,
    predicted_comments INTEGER,
    predicted_shares INTEGER,
    predicted_reach INTEGER,
    predicted_engagement_rate DECIMAL(5,4),
    confidence_score DECIMAL(3,2),
    accuracy_score DECIMAL(3,2), -- Calculated after actual performance
    created_at TIMESTAMP DEFAULT NOW()
);

-- Optimal posting times
CREATE TABLE optimal_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
    hour INTEGER, -- 0-23
    engagement_score DECIMAL(5,4),
    confidence_score DECIMAL(3,2),
    sample_size INTEGER,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, day_of_week, hour)
);

-- Content scheduling
CREATE TABLE scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],
    hashtags TEXT[],
    scheduled_for TIMESTAMP NOT NULL,
    status VARCHAR DEFAULT 'pending', -- 'pending', 'publishing', 'published', 'failed'
    ai_optimized BOOLEAN DEFAULT false,
    optimization_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Hashtag performance tracking
CREATE TABLE hashtag_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    hashtag VARCHAR NOT NULL,
    usage_count INTEGER DEFAULT 1,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_reach INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
    trend_score DECIMAL(5,4) DEFAULT 0,
    last_used TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, hashtag)
);

-- Competitor analysis
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR NOT NULL,
    competitor_username VARCHAR NOT NULL,
    competitor_name VARCHAR,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform, competitor_username)
);

CREATE TABLE competitor_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    followers_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
    top_performing_posts JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(competitor_id, date)
);

-- Analytics reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    date_range_start DATE,
    date_range_end DATE,
    accounts UUID[], -- Array of account IDs
    report_data JSONB NOT NULL,
    status VARCHAR DEFAULT 'generated', -- 'generating', 'generated', 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Background jobs tracking
CREATE TABLE job_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR NOT NULL,
    job_data JSONB NOT NULL,
    status VARCHAR DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_for TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_posts_account_id ON posts(account_id);
CREATE INDEX idx_posts_posted_at ON posts(posted_at);
CREATE INDEX idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX idx_account_metrics_account_date ON account_metrics(account_id, date);
CREATE INDEX idx_ai_insights_user_account ON ai_insights(user_id, account_id);
CREATE INDEX idx_scheduled_posts_time ON scheduled_posts(scheduled_for) WHERE status = 'pending';

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimal_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own social accounts" ON social_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own account metrics" ON account_metrics FOR ALL USING (
  auth.uid() = (SELECT user_id FROM social_accounts WHERE id = account_id)
);
CREATE POLICY "Users can view own posts" ON posts FOR ALL USING (
  auth.uid() = (SELECT user_id FROM social_accounts WHERE id = account_id)
);
CREATE POLICY "Users can view own post metrics" ON post_metrics FOR ALL USING (
  auth.uid() = (SELECT sa.user_id FROM social_accounts sa JOIN posts p ON sa.id = p.account_id WHERE p.id = post_id)
);
