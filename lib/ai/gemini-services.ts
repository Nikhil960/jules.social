import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export interface PostPrediction {
  predicted_engagement_rate: number
  predicted_likes: number
  predicted_comments: number
  predicted_shares: number
  predicted_reach: number
  confidence_score: number
  performance_factors: {
    positive: string[]
    negative: string[]
  }
  optimization_suggestions: string[]
  best_posting_time: string
  hashtag_recommendations: string[]
}

export interface SentimentAnalysis {
  text: string
  sentiment: "positive" | "neutral" | "negative"
  score: number
  confidence: number
  emotions: string[]
  intent: "complaint" | "compliment" | "question" | "general"
}

export interface ContentSuggestion {
  content_type: "post" | "story" | "reel" | "video"
  title: string
  caption: string
  hashtags: string[]
  best_time: string
  predicted_engagement: number
  content_pillars: string[]
  call_to_action: string
}

export interface OptimalTiming {
  daily_optimal_times: Array<{
    day: string
    times: string[]
    confidence: number
  }>
  best_overall_times: string[]
  worst_times_to_avoid: string[]
  patterns_discovered: string[]
  recommendations: string
}

export interface CompetitorAnalysis {
  performance_comparison: {
    follower_rank: number
    engagement_rank: number
    content_quality_score: number
  }
  competitor_strengths: string[]
  opportunities: string[]
  content_gaps: string[]
  hashtag_opportunities: string[]
  optimal_posting_frequency: string
  action_items: string[]
}

export interface AutomatedReport {
  executive_summary: string
  key_metrics: {
    total_followers: number
    follower_growth: string
    total_engagement: number
    engagement_rate: string
    reach: number
    impressions: number
  }
  performance_highlights: string[]
  areas_for_improvement: string[]
  top_performing_content: Array<{
    content: string
    engagement_rate: string
    why_it_worked: string
  }>
  recommendations: string[]
  next_period_goals: string[]
  trending_hashtags: string[]
  optimal_posting_schedule: string
}

export class AIServices {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" })

  async predictPostPerformance(postData: any, historicalData: any[]): Promise<PostPrediction> {
    try {
      const prompt = `
      Analyze this social media post and predict its performance based on historical data:
      
      POST DATA:
      Content: "${postData.content}"
      Platform: ${postData.platform}
      Hashtags: ${postData.hashtags?.join(", ")}
      Post Type: ${postData.post_type}
      Scheduled Time: ${postData.scheduled_for}
      
      HISTORICAL PERFORMANCE (last 20 posts):
      ${historicalData
        .map(
          (post) => `
      Content: "${post.content?.substring(0, 100)}..."
      Engagement Rate: ${post.post_metrics?.engagement_rate}%
      Likes: ${post.post_metrics?.likes}
      Comments: ${post.post_metrics?.comments}
      Shares: ${post.post_metrics?.shares}
      Posted: ${post.posted_at}
      `,
        )
        .join("\n")}
      
      Provide a JSON response with:
      {
        "predicted_engagement_rate": number (0-100),
        "predicted_likes": number,
        "predicted_comments": number,
        "predicted_shares": number,
        "predicted_reach": number,
        "confidence_score": number (0-1),
        "performance_factors": {
          "positive": ["factor1", "factor2"],
          "negative": ["factor1", "factor2"]
        },
        "optimization_suggestions": ["suggestion1", "suggestion2"],
        "best_posting_time": "HH:MM",
        "hashtag_recommendations": ["#hashtag1", "#hashtag2"]
      }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      // Clean and parse JSON response
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error predicting post performance:", error)
      throw new Error("Failed to predict post performance")
    }
  }

  async analyzeSentiment(texts: string[]): Promise<SentimentAnalysis[]> {
    try {
      const prompt = `
      Analyze the sentiment of these social media comments/mentions:
      
      ${texts.map((text, i) => `${i + 1}. "${text}"`).join("\n")}
      
      Return JSON array with sentiment analysis:
      [
        {
          "text": "original text",
          "sentiment": "positive|neutral|negative",
          "score": number (-1 to 1),
          "confidence": number (0-1),
          "emotions": ["joy", "anger", "surprise"],
          "intent": "complaint|compliment|question|general"
        }
      ]
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error analyzing sentiment:", error)
      throw new Error("Failed to analyze sentiment")
    }
  }

  async generateContentSuggestions(accountData: any, trendsData: any): Promise<ContentSuggestion[]> {
    try {
      const prompt = `
      Generate content suggestions for a ${accountData.platform} account:
      
      ACCOUNT INFO:
      Username: ${accountData.username}
      Follower Count: ${accountData.followers_count}
      Average Engagement: ${accountData.avg_engagement_rate}%
      Top Performing Content Types: ${accountData.top_content_types}
      
      RECENT TRENDS:
      ${trendsData.map((trend: any) => `- ${trend.keyword}: ${trend.volume} mentions`).join("\n")}
      
      Generate 5 content ideas in JSON format:
      [
        {
          "content_type": "post|story|reel|video",
          "title": "engaging title",
          "caption": "full caption text",
          "hashtags": ["#hashtag1", "#hashtag2"],
          "best_time": "HH:MM",
          "predicted_engagement": number,
          "content_pillars": ["education", "entertainment", "inspiration"],
          "call_to_action": "specific CTA text"
        }
      ]
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error generating content suggestions:", error)
      throw new Error("Failed to generate content suggestions")
    }
  }

  async findOptimalPostingTimes(postHistory: any[]): Promise<OptimalTiming> {
    try {
      const prompt = `
      Analyze posting times and engagement patterns to find optimal posting schedule:
      
      HISTORICAL DATA:
      ${postHistory
        .map(
          (post) => `
      Posted: ${post.posted_at} (${new Date(post.posted_at).getDay()}, ${new Date(post.posted_at).getHours()}:00)
      Engagement Rate: ${post.post_metrics?.engagement_rate}%
      Reach: ${post.post_metrics?.reach}
      `,
        )
        .join("\n")}
      
      Return optimal posting times in JSON:
      {
        "daily_optimal_times": [
          {
            "day": "Monday",
            "times": ["09:00", "13:00", "18:00"],
            "confidence": 0.85
          }
        ],
        "best_overall_times": ["09:00", "13:00", "18:00"],
        "worst_times_to_avoid": ["02:00", "04:00"],
        "patterns_discovered": ["weekday mornings perform better", "evening posts get more comments"],
        "recommendations": "Post 3 times per day at suggested times for maximum reach"
      }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error finding optimal posting times:", error)
      throw new Error("Failed to find optimal posting times")
    }
  }

  async analyzeCompetitors(userData: any, competitorData: any[]): Promise<CompetitorAnalysis> {
    try {
      const prompt = `
      Analyze competitor performance vs user account:
      
      USER ACCOUNT:
      Followers: ${userData.followers_count}
      Avg Engagement: ${userData.avg_engagement_rate}%
      Post Frequency: ${userData.posts_per_week}/week
      
      COMPETITORS:
      ${competitorData
        .map(
          (comp) => `
      ${comp.username}: ${comp.followers_count} followers, ${comp.avg_engagement_rate}% engagement
      Top content: ${comp.top_performing_posts?.map((p: any) => p.content?.substring(0, 50)).join(", ")}
      `,
        )
        .join("\n")}
      
      Provide competitive analysis in JSON:
      {
        "performance_comparison": {
          "follower_rank": number,
          "engagement_rank": number,
          "content_quality_score": number
        },
        "competitor_strengths": ["what they do better"],
        "opportunities": ["gaps user can exploit"],
        "content_gaps": ["types of content competitors post that user doesn't"],
        "hashtag_opportunities": ["#hashtag1", "#hashtag2"],
        "optimal_posting_frequency": "X posts per week",
        "action_items": ["specific recommendations"]
      }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error analyzing competitors:", error)
      throw new Error("Failed to analyze competitors")
    }
  }

  async generateAutomatedReport(metricsData: any, timeframe: string): Promise<AutomatedReport> {
    try {
      const prompt = `
      Generate an automated ${timeframe} social media performance report:
      
      METRICS DATA:
      ${JSON.stringify(metricsData, null, 2)}
      
      Create a comprehensive report in JSON format:
      {
        "executive_summary": "brief overview of performance",
        "key_metrics": {
          "total_followers": number,
          "follower_growth": "+X (+Y%)",
          "total_engagement": number,
          "engagement_rate": "X%",
          "reach": number,
          "impressions": number
        },
        "performance_highlights": ["achievement 1", "achievement 2"],
        "areas_for_improvement": ["area 1", "area 2"],
        "top_performing_content": [
          {
            "content": "post content",
            "engagement_rate": "X%",
            "why_it_worked": "analysis"
          }
        ],
        "recommendations": ["actionable recommendation 1", "recommendation 2"],
        "next_period_goals": ["goal 1", "goal 2"],
        "trending_hashtags": ["#hashtag1", "#hashtag2"],
        "optimal_posting_schedule": "schedule recommendation"
      }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error generating automated report:", error)
      throw new Error("Failed to generate automated report")
    }
  }

  async optimizeContent(
    content: string,
    platform: string,
    targetAudience?: string,
  ): Promise<{
    optimized_content: string
    improvements_made: string[]
    hashtag_suggestions: string[]
    engagement_prediction: number
  }> {
    try {
      const prompt = `
      Optimize this social media content for better engagement:
      
      ORIGINAL CONTENT: "${content}"
      PLATFORM: ${platform}
      TARGET AUDIENCE: ${targetAudience || "General"}
      
      Provide optimized version in JSON:
      {
        "optimized_content": "improved version of the content",
        "improvements_made": ["what was changed and why"],
        "hashtag_suggestions": ["#relevant", "#hashtags"],
        "engagement_prediction": number (0-100)
      }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error optimizing content:", error)
      throw new Error("Failed to optimize content")
    }
  }
}

export const aiServices = new AIServices()
