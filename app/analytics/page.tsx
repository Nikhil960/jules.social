"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Eye, 
  Heart, 
  Share2, 
  BarChart3,
  Calendar,
  Download,
  Filter,
  ArrowLeft,
  Instagram,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  overview: {
    total_followers: number
    total_posts: number
    avg_engagement_rate: number
    total_reach: number
    total_impressions: number
    follower_growth: number
    engagement_growth: number
  }
  platforms: {
    platform: string
    followers: number
    posts: number
    engagement_rate: number
    reach: number
    growth: number
  }[]
  top_posts: {
    id: string
    platform: string
    content: string
    likes: number
    comments: number
    shares: number
    reach: number
    date: string
  }[]
  audience_insights: {
    age_groups: { range: string; percentage: number }[]
    gender: { male: number; female: number; other: number }
    top_locations: { country: string; percentage: number }[]
    active_hours: { hour: number; engagement: number }[]
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState("30d")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string>("")

  useEffect(() => {
    const storedToken = localStorage.getItem("postcraft_token")
    const storedUser = localStorage.getItem("postcraft_user")

    if (!storedToken || !storedUser) {
      router.push("/login")
      return
    }

    setToken(storedToken)
    setUser(JSON.parse(storedUser))
    fetchAnalytics(storedToken)
  }, [router, timeframe, selectedPlatform])

  const fetchAnalytics = async (authToken: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/overview?timeframe=${timeframe}&platform=${selectedPlatform}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!analytics) {
    return <div className="flex items-center justify-center min-h-screen">No data available</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="x">X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.total_followers.toLocaleString()}</div>
            <div className="flex items-center pt-1 text-sm">
              <Badge variant={analytics.overview.follower_growth >= 0 ? "success" : "destructive"}>
                {analytics.overview.follower_growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(analytics.overview.follower_growth)}%
              </Badge>
              <span className="text-muted-foreground ml-2">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.avg_engagement_rate.toFixed(1)}%</div>
            <div className="flex items-center pt-1 text-sm">
              <Badge variant={analytics.overview.engagement_growth >= 0 ? "success" : "destructive"}>
                {analytics.overview.engagement_growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(analytics.overview.engagement_growth)}%
              </Badge>
              <span className="text-muted-foreground ml-2">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.total_reach.toLocaleString()}</div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">75% of target reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.total_posts}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {analytics.overview.total_posts > 0 
                ? `Last post ${new Date().toLocaleDateString()}`
                : 'No posts yet'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Add your preferred chart component here */}
                <div className="h-[350px]">Chart placeholder</div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add your preferred chart component here */}
                <div className="h-[350px]">Chart placeholder</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics.platforms.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{platform.platform}</CardTitle>
                  {platform.platform === 'instagram' && <Instagram className="h-4 w-4" />}
                  {platform.platform === 'x' && <Twitter className="h-4 w-4" />}
                  {platform.platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                  {platform.platform === 'youtube' && <Youtube className="h-4 w-4" />}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Followers</span>
                      <span className="font-medium">{platform.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Posts</span>
                      <span className="font-medium">{platform.posts}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Engagement Rate</span>
                      <span className="font-medium">{platform.engagement_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Growth</span>
                      <Badge variant={platform.growth >= 0 ? "success" : "destructive"}>
                        {platform.growth >= 0 ? "+" : ""}{platform.growth}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {analytics.top_posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                      {post.platform === 'instagram' && <Instagram className="h-6 w-6" />}
                      {post.platform === 'x' && <Twitter className="h-6 w-6" />}
                      {post.platform === 'linkedin' && <Linkedin className="h-6 w-6" />}
                      {post.platform === 'youtube' && <Youtube className="h-6 w-6" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{post.content}</p>
                      <p className="text-sm text-muted-foreground">
                        Posted on {new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {post.shares}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.reach.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Age Distribution</h4>
                    <div className="space-y-2">
                      {analytics.audience_insights.age_groups.map((group) => (
                        <div key={group.range} className="flex items-center">
                          <div className="w-16 text-sm">{group.range}</div>
                          <div className="flex-1">
                            <Progress value={group.percentage} className="h-2" />
                          </div>
                          <div className="w-12 text-sm text-right">{group.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-4">Gender Distribution</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{analytics.audience_insights.gender.male}%</div>
                        <div className="text-xs text-muted-foreground">Male</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{analytics.audience_insights.gender.female}%</div>
                        <div className="text-xs text-muted-foreground">Female</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{analytics.audience_insights.gender.other}%</div>
                        <div className="text-xs text-muted-foreground">Other</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {analytics.audience_insights.top_locations.map((location) => (
                    <div key={location.country} className="flex items-center">
                      <div className="flex-1 text-sm">{location.country}</div>
                      <div className="ml-auto text-sm">{location.percentage}%</div>
                      <div className="ml-4 w-24">
                        <Progress value={location.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}