import { type NextRequest, NextResponse } from "next/server"
import { verifySignature } from "@upstash/qstash/nextjs"
import { DatabaseService } from "@/lib/database/supabase"
import { aiServices } from "@/lib/ai/gemini-services"

class AIAnalysisHandler {
  async handler(request: NextRequest) {
    try {
      const { userId, analysisType = "full", jobType } = await request.json()

      if (jobType !== "ai_analysis") {
        return NextResponse.json({ error: "Invalid job type" }, { status: 400 })
      }

      console.log(`Starting AI analysis for user ${userId}, type: ${analysisType}`)

      // Get user's social accounts
      const accounts = await DatabaseService.getUserSocialAccounts(userId)

      const analysisResults = []

      for (const account of accounts) {
        try {
          // Get historical posts for analysis
          const posts = await DatabaseService.getPostsWithMetrics(account.id, 50, 0)

          if (posts.length === 0) {
            console.log(`No posts found for account ${account.id}, skipping analysis`)
            continue
          }

          // Optimal timing analysis
          if (analysisType === "full" || analysisType === "timing") {
            const optimalTiming = await aiServices.findOptimalPostingTimes(posts)

            await DatabaseService.createAIInsight({
              user_id: userId,
              account_id: account.id,
              insight_type: "optimal_timing",
              insight_data: optimalTiming,
              confidence_score: 0.85,
            })

            analysisResults.push({
              account_id: account.id,
              analysis_type: "optimal_timing",
              result: optimalTiming,
            })
          }

          // Content suggestions
          if (analysisType === "full" || analysisType === "content") {
            const accountData = {
              platform: account.platform,
              username: account.username,
              followers_count: account.account_data?.followers_count || 0,
              avg_engagement_rate: this.calculateAverageEngagement(posts),
              top_content_types: this.getTopContentTypes(posts),
            }

            // Mock trends data
            const trendsData = [
              { keyword: "trending topic 1", volume: 10000 },
              { keyword: "trending topic 2", volume: 8000 },
            ]

            const suggestions = await aiServices.generateContentSuggestions(accountData, trendsData)

            await DatabaseService.createAIInsight({
              user_id: userId,
              account_id: account.id,
              insight_type: "content_suggestion",
              insight_data: { suggestions },
              confidence_score: 0.8,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            })

            analysisResults.push({
              account_id: account.id,
              analysis_type: "content_suggestions",
              result: suggestions,
            })
          }

          // Sentiment analysis of recent comments
          if (analysisType === "full" || analysisType === "sentiment") {
            const recentComments = await DatabaseService.getRecentComments(account.id, 50)

            if (recentComments.length > 0) {
              const commentTexts = recentComments.map((c) => c.content).filter(Boolean)

              if (commentTexts.length > 0) {
                const sentimentAnalysis = await aiServices.analyzeSentiment(commentTexts)

                // Update comments with sentiment scores
                for (let i = 0; i < sentimentAnalysis.length; i++) {
                  if (recentComments[i]) {
                    await DatabaseService.updateCommentSentiment(recentComments[i].id, sentimentAnalysis[i].score)
                  }
                }

                await DatabaseService.createAIInsight({
                  user_id: userId,
                  account_id: account.id,
                  insight_type: "sentiment_analysis",
                  insight_data: {
                    overall_sentiment: this.calculateOverallSentiment(sentimentAnalysis),
                    sentiment_breakdown: this.getSentimentBreakdown(sentimentAnalysis),
                    total_comments_analyzed: sentimentAnalysis.length,
                  },
                  confidence_score: 0.9,
                })

                analysisResults.push({
                  account_id: account.id,
                  analysis_type: "sentiment_analysis",
                  result: sentimentAnalysis,
                })
              }
            }
          }
        } catch (accountError) {
          console.error(`Error analyzing account ${account.id}:`, accountError)
          analysisResults.push({
            account_id: account.id,
            error: accountError instanceof Error ? accountError.message : "Analysis failed",
          })
        }
      }

      console.log(`AI analysis completed for user ${userId}:`, analysisResults)

      return NextResponse.json({
        success: true,
        results: analysisResults,
      })
    } catch (error) {
      console.error("Error in AI analysis job:", error)

      return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 })
    }
  }

  private calculateAverageEngagement(posts: any[]): number {
    if (posts.length === 0) return 0

    const totalEngagement = posts.reduce((sum, post) => {
      return sum + (post.post_metrics?.engagement_rate || 0)
    }, 0)

    return totalEngagement / posts.length
  }

  private getTopContentTypes(posts: any[]): string[] {
    const typeCount: { [key: string]: number } = {}

    posts.forEach((post) => {
      typeCount[post.post_type] = (typeCount[post.post_type] || 0) + 1
    })

    return Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type)
  }

  private calculateOverallSentiment(sentimentAnalysis: any[]): string {
    const avgScore = sentimentAnalysis.reduce((sum, s) => sum + s.score, 0) / sentimentAnalysis.length

    if (avgScore > 0.1) return "positive"
    if (avgScore < -0.1) return "negative"
    return "neutral"
  }

  private getSentimentBreakdown(sentimentAnalysis: any[]): any {
    const breakdown = { positive: 0, neutral: 0, negative: 0 }

    sentimentAnalysis.forEach((s) => {
      breakdown[s.sentiment as keyof typeof breakdown]++
    })

    return breakdown
  }
}

const handlerInstance = new AIAnalysisHandler()
export const POST = verifySignature(handlerInstance.handler.bind(handlerInstance))
