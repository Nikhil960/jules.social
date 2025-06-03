import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyAi0NlCYgFsPxSLkXR0vaVV786Q_cLNT2Y")

export interface ContentSuggestion {
  title: string
  content: string
  hashtags: string[]
  platform_specific: {
    [platform: string]: {
      content: string
      character_count: number
    }
  }
  engagement_prediction: number
  best_time: string
  content_type: string
}

export interface PostOptimization {
  optimized_content: string
  improvements: string[]
  hashtag_suggestions: string[]
  platform_specific_tips: {
    [platform: string]: string[]
  }
  engagement_score: number
}

export interface AnalyticsInsight {
  insight_type: "growth" | "engagement" | "content" | "timing"
  title: string
  description: string
  recommendation: string
  confidence: number
  data_points: any[]
}

export class GeminiAIService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" })

  async generateContentSuggestions(
    userProfile: any,
    recentPosts: any[],
    targetPlatforms: string[],
  ): Promise<ContentSuggestion[]> {
    try {
      const prompt = `
        As a social media expert, generate 5 engaging content ideas for the following profile:
        
        User Profile:
        - Platforms: ${targetPlatforms.join(", ")}
        - Recent posts performance: ${recentPosts.map((p) => `"${p.content.substring(0, 50)}..." (${p.analytics || "No analytics"})`).join(", ")}
        
        Generate content suggestions that would perform well on these platforms. Consider:
        - Current trends and viral content patterns
        - Platform-specific best practices
        - Engagement optimization
        - Hashtag strategies
        
        Return a JSON array with this structure:
        [
          {
            "title": "Content idea title",
            "content": "Full content text",
            "hashtags": ["#hashtag1", "#hashtag2"],
            "platform_specific": {
              "instagram": {"content": "Instagram version", "character_count": 150},
              "x": {"content": "X version", "character_count": 280}
            },
            "engagement_prediction": 85,
            "best_time": "18:00",
            "content_type": "educational"
          }
        ]
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      // Clean and parse JSON response
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error generating content suggestions:", error)
      // Return fallback suggestions
      return this.getFallbackSuggestions(targetPlatforms)
    }
  }

  async optimizeContent(content: string, targetPlatforms: string[], contentType = "post"): Promise<PostOptimization> {
    try {
      const prompt = `
        Optimize this social media content for better engagement:
        
        Original Content: "${content}"
        Target Platforms: ${targetPlatforms.join(", ")}
        Content Type: ${contentType}
        
        Provide optimization suggestions including:
        - Improved content version
        - Platform-specific adaptations
        - Hashtag recommendations
        - Engagement improvement tips
        
        Return JSON with this structure:
        {
          "optimized_content": "Improved version of the content",
          "improvements": ["List of improvements made"],
          "hashtag_suggestions": ["#relevant", "#hashtags"],
          "platform_specific_tips": {
            "instagram": ["tip1", "tip2"],
            "x": ["tip1", "tip2"]
          },
          "engagement_score": 78
        }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error optimizing content:", error)
      return this.getFallbackOptimization(content, targetPlatforms)
    }
  }

  async generateAnalyticsInsights(accountData: any[], timeframe = "30d"): Promise<AnalyticsInsight[]> {
    try {
      const prompt = `
        Analyze this social media performance data and provide actionable insights:
        
        Account Data: ${JSON.stringify(accountData, null, 2)}
        Timeframe: ${timeframe}
        
        Generate insights about:
        - Growth patterns and trends
        - Engagement optimization opportunities
        - Content performance analysis
        - Optimal posting times
        - Audience behavior patterns
        
        Return JSON array with this structure:
        [
          {
            "insight_type": "growth",
            "title": "Follower Growth Acceleration",
            "description": "Your follower growth has increased by 25% this month",
            "recommendation": "Continue posting educational content as it drives the most growth",
            "confidence": 0.85,
            "data_points": [{"metric": "followers", "change": "+25%"}]
          }
        ]
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error generating analytics insights:", error)
      return this.getFallbackInsights()
    }
  }

  async generateHashtagSuggestions(content: string, platform: string, niche?: string): Promise<string[]> {
    try {
      const prompt = `
        Generate relevant hashtags for this social media content:
        
        Content: "${content}"
        Platform: ${platform}
        Niche: ${niche || "general"}
        
        Provide 10-15 hashtags that would maximize reach and engagement.
        Mix of popular, medium, and niche-specific hashtags.
        
        Return as JSON array: ["#hashtag1", "#hashtag2", ...]
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error generating hashtags:", error)
      return ["#socialmedia", "#content", "#engagement", "#marketing"]
    }
  }

  async predictPostPerformance(
    content: string,
    platform: string,
    scheduledTime: string,
    historicalData: any[],
  ): Promise<{
    engagement_prediction: number
    reach_prediction: number
    performance_factors: string[]
    optimization_tips: string[]
  }> {
    try {
      const prompt = `
        Predict the performance of this social media post:
        
        Content: "${content}"
        Platform: ${platform}
        Scheduled Time: ${scheduledTime}
        Historical Performance: ${JSON.stringify(historicalData.slice(0, 10))}
        
        Based on the content quality, timing, and historical performance patterns,
        predict engagement and reach. Provide optimization tips.
        
        Return JSON:
        {
          "engagement_prediction": 75,
          "reach_prediction": 1200,
          "performance_factors": ["Good timing", "Engaging content"],
          "optimization_tips": ["Add more hashtags", "Include call-to-action"]
        }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanedResponse)
    } catch (error) {
      console.error("Error predicting post performance:", error)
      return {
        engagement_prediction: 65,
        reach_prediction: 800,
        performance_factors: ["Content quality", "Posting time"],
        optimization_tips: ["Add relevant hashtags", "Include engaging visuals"],
      }
    }
  }

  private getFallbackSuggestions(platforms: string[]): ContentSuggestion[] {
    return [
      {
        title: "Behind the Scenes Content",
        content:
          "Share what goes on behind the scenes of your work or daily life. People love authentic, unpolished moments!",
        hashtags: ["#behindthescenes", "#authentic", "#reallife"],
        platform_specific: {
          instagram: {
            content: "Behind the scenes magic ✨ What goes into creating content you love!",
            character_count: 85,
          },
       x: {
          content: "X version",
          character_count: 280,
        },
        },
        engagement_prediction: 75,
        best_time: "18:00",
        content_type: "authentic",
      },
    ]
  }

  private getFallbackOptimization(content: string, platforms: string[]): PostOptimization {
    return {
      optimized_content: content + " 🚀",
      improvements: ["Added engaging emoji", "Maintained original message"],
      hashtag_suggestions: ["#socialmedia", "#content", "#engagement"],
      x: ['#tweet', '#trending', '#followback', '#news', '#viral', '#socialmedia', '#follow', '#retweet', '#tbt', '#tweetoftheday'],
      platform_specific_tips: {
        instagram: ["Use high-quality visuals", "Add relevant hashtags"],
       x: [
          "Use strong hooks to grab attention.",
          "Keep it concise and to the point.",
          "Utilize relevant hashtags to increase visibility.",
          "Engage with replies and mentions.",
          "Post consistently during peak hours."
        ],
      },
      engagement_score: 70,
    }
  }

  private getFallbackInsights(): AnalyticsInsight[] {
    return [
      {
        insight_type: "engagement",
        title: "Engagement Opportunity",
        description: "Your posts perform better in the evening hours",
        recommendation: "Schedule more content between 6-8 PM for maximum engagement",
        confidence: 0.8,
        data_points: [{ time: "18:00-20:00", engagement: "+35%" }],
      },
    ]
  }
}

export const geminiAI = new GeminiAIService()
