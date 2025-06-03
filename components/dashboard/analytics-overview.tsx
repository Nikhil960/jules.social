"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, MessageSquare, Eye, BarChart3 } from "lucide-react"

interface AnalyticsData {
  total_followers: number
  total_posts: number
  avg_engagement_rate: number
  total_accounts: number
  accounts_summary: any[]
  recent_posts: any[]
  insights: any[]
}

interface AnalyticsOverviewProps {
  token: string
}

export default function AnalyticsOverview({ token }: AnalyticsOverviewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState("30d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/overview?timeframe=${timeframe}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setAnalytics(data.overview)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-4 border-black rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card className="border-4 border-black rounded-xl p-6 text-center">
        <p>No analytics data available</p>
      </Card>
    )
  }

  const statCards = [
    {
      title: "Total Followers",
      value: analytics.total_followers.toLocaleString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-br from-blue-500 to-purple-500",
    },
    {
      title: "Total Posts",
      value: analytics.total_posts.toString(),
      icon: <MessageSquare className="h-6 w-6" />,
      color: "bg-gradient-to-br from-green-500 to-teal-500",
    },
    {
      title: "Avg Engagement",
      value: `${analytics.avg_engagement_rate.toFixed(1)}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
      title: "Connected Accounts",
      value: analytics.total_accounts.toString(),
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-black">ANALYTICS OVERVIEW</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] border-2 border-black rounded-xl">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className={`p-4 text-white ${stat.color}`}>
              {stat.icon}
              <h3 className="text-sm font-bold mt-2 opacity-90">{stat.title}</h3>
            </div>
            <div className="p-4 bg-white">
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Accounts Summary */}
      <Card className="border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-black mb-4">ACCOUNT PERFORMANCE</h3>
        <div className="space-y-4">
          {analytics.accounts_summary.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/50 border-2 border-black rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    account.platform === "instagram"
                      ? "bg-gradient-to-br from-purple-500 to-pink-500"
                      : account.platform === "x"
                        ? "bg-blue-400"
                        : account.platform === "linkedin"
                          ? "bg-blue-600"
                          : "bg-red-500"
                  }`}
                >
                  {account.platform.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">@{account.username}</p>
                  <p className="text-sm text-gray-600 capitalize">{account.platform}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{account.followers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">followers</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
      {analytics.insights && analytics.insights.length > 0 && (
        <Card className="border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black mb-4">AI INSIGHTS</h3>
          <div className="space-y-4">
            {analytics.insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="p-4 bg-white/50 border-2 border-black rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <p className="text-sm font-medium">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Posts */}
      <Card className="border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-black mb-4">RECENT POSTS</h3>
        <div className="space-y-4">
          {analytics.recent_posts.slice(0, 5).map((post, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-white/50 border-2 border-black rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="font-medium mb-1">{post.content.substring(0, 100)}...</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="capitalize">{post.status}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  {post.platforms && <span>{JSON.parse(post.platforms).join(", ")}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
