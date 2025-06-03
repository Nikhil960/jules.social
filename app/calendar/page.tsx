"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar as CalendarIcon,
  Plus,
  ArrowLeft,
  ArrowRight,
  Clock,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Edit,
  Trash2,
  Copy,
  Eye,
  Send,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

interface ScheduledPost {
  id: string
  title: string
  content: string
  platforms: string[]
  scheduled_time: string
  status: 'scheduled' | 'published' | 'failed' | 'draft'
  media_urls?: string[]
  engagement_prediction?: number
}

interface CalendarDay {
  date: Date
  posts: ScheduledPost[]
  isCurrentMonth: boolean
  isToday: boolean
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string>("")
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    platforms: [] as string[],
    scheduled_time: '',
    media_urls: [] as string[]
  })

  useEffect(() => {
    const storedToken = localStorage.getItem("postcraft_token")
    const storedUser = localStorage.getItem("postcraft_user")

    if (!storedToken || !storedUser) {
      router.push("/login")
      return
    }

    setToken(storedToken)
    setUser(JSON.parse(storedUser))
    fetchScheduledPosts(storedToken)
  }, [router])

  const fetchScheduledPosts = async (authToken: string) => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockPosts: ScheduledPost[] = [
        {
          id: '1',
          title: 'Monday Motivation Post',
          content: 'Start your week with positive energy! 💪 #MondayMotivation #Success',
          platforms: ['Instagram', 'X'],
          scheduled_time: '2024-01-22T09:00:00',
          status: 'scheduled',
          engagement_prediction: 85
        },
        {
          id: '2',
          title: 'Product Launch Announcement',
          content: 'Exciting news! Our new product is launching next week. Stay tuned for more details! 🚀',
          platforms: ['LinkedIn', 'X'],
          scheduled_time: '2024-01-23T14:30:00',
          status: 'scheduled',
          engagement_prediction: 92
        },
        {
          id: '3',
          title: 'Behind the Scenes Video',
          content: 'Take a look behind the scenes of our latest campaign! 🎬',
          platforms: ['Instagram', 'YouTube'],
          scheduled_time: '2024-01-24T16:00:00',
          status: 'scheduled',
          engagement_prediction: 78
        },
        {
          id: '4',
          title: 'Weekly Tips Thursday',
          content: '5 tips to boost your productivity this week! Thread below 👇',
          platforms: ['X', 'LinkedIn'],
          scheduled_time: '2024-01-25T11:00:00',
          status: 'scheduled',
          engagement_prediction: 88
        },
        {
          id: '5',
          title: 'Friday Feature',
          content: 'Featuring our amazing team member Sarah! 👏 #TeamSpotlight',
          platforms: ['Instagram', 'LinkedIn'],
          scheduled_time: '2024-01-26T15:30:00',
          status: 'scheduled',
          engagement_prediction: 76
        }
      ]
      
      setTimeout(() => {
        setScheduledPosts(mockPosts)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching scheduled posts:", error)
      setIsLoading(false)
    }
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayPosts = scheduledPosts.filter(post => {
        const postDate = new Date(post.scheduled_time)
        return postDate.toDateString() === date.toDateString()
      })
      
      days.push({
        date,
        posts: filterPlatform === 'all' ? dayPosts : dayPosts.filter(post => 
          post.platforms.some(p => p.toLowerCase() === filterPlatform.toLowerCase())
        ),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    return days
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="h-3 w-3" />
      case 'x': return <Twitter className="h-3 w-3" />
      case 'linkedin': return <Linkedin className="h-3 w-3" />
      case 'youtube': return <Youtube className="h-3 w-3" />
      default: return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'x': return 'bg-black'
      case 'linkedin': return 'bg-blue-600'
      case 'youtube': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500'
      case 'published': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'draft': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleCreatePost = () => {
    // In a real app, this would make an API call
    const post: ScheduledPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      platforms: newPost.platforms,
      scheduled_time: newPost.scheduled_time,
      status: 'scheduled',
      engagement_prediction: Math.floor(Math.random() * 30) + 70
    }
    
    setScheduledPosts(prev => [...prev, post])
    setNewPost({
      title: '',
      content: '',
      platforms: [],
      scheduled_time: '',
      media_urls: []
    })
    setIsCreateDialogOpen(false)
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-2 sm:p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-2 sm:p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-white/40 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="icon" className="rounded-xl border-2 border-black">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">CALENDAR</h1>
                <p className="text-gray-600">Schedule and manage your content</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={viewMode} onValueChange={(value: 'month' | 'week' | 'day') => setViewMode(value)}>
                <SelectTrigger className="w-full sm:w-[120px] rounded-xl border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-full sm:w-[140px] rounded-xl border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="x">X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-4 border-black rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black">Schedule New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Post Title</label>
                      <Input
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter post title..."
                        className="rounded-xl border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold mb-2">Content</label>
                      <Textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your post content..."
                        className="rounded-xl border-2 border-black min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold mb-2">Platforms</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Instagram', 'X', 'LinkedIn', 'YouTube'].map(platform => (
                          <Button
                            key={platform}
                            variant={newPost.platforms.includes(platform) ? "default" : "outline"}
                            onClick={() => {
                              setNewPost(prev => ({
                                ...prev,
                                platforms: prev.platforms.includes(platform)
                                  ? prev.platforms.filter(p => p !== platform)
                                  : [...prev.platforms, platform]
                              }))
                            }}
                            className="rounded-xl border-2 border-black font-bold"
                          >
                            {getPlatformIcon(platform)}
                            <span className="ml-2">{platform}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold mb-2">Schedule Time</label>
                      <Input
                        type="datetime-local"
                        value={newPost.scheduled_time}
                        onChange={(e) => setNewPost(prev => ({ ...prev, scheduled_time: e.target.value }))}
                        className="rounded-xl border-2 border-black"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPost.title || !newPost.content || newPost.platforms.length === 0 || !newPost.scheduled_time}
                        className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold flex-1"
                      >
                        Schedule Post
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="rounded-xl border-2 border-black font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="rounded-xl border-2 border-black"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <h2 className="text-xl sm:text-2xl font-black">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="rounded-xl border-2 border-black"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              className="rounded-xl border-2 border-black font-bold"
            >
              Today
            </Button>
          </div>

          {/* Calendar Grid */}
          <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-0">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b-2 border-black">
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center font-black text-sm bg-white/50">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                      !day.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white/30'
                    } ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}`}
                  >
                    <div className={`text-sm font-bold mb-2 ${
                      !day.isCurrentMonth ? 'text-gray-400' : day.isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {day.posts.slice(0, 3).map(post => (
                        <div
                          key={post.id}
                          className="text-xs p-1 rounded bg-white/80 border border-gray-300 cursor-pointer hover:bg-white transition-colors"
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <div className="flex gap-1">
                              {post.platforms.slice(0, 2).map(platform => (
                                <div key={platform} className={`w-3 h-3 rounded-full ${getPlatformColor(platform)} flex items-center justify-center`}>
                                  {getPlatformIcon(platform)}
                                </div>
                              ))}
                            </div>
                            <Badge className={`${getStatusColor(post.status)} text-white text-xs px-1 py-0 h-4`}>
                              {post.status}
                            </Badge>
                          </div>
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-gray-600 text-xs">
                            {new Date(post.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                      
                      {day.posts.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{day.posts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Posts */}
          <div className="mt-6">
            <h3 className="text-xl font-black mb-4">Upcoming Posts</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scheduledPosts
                .filter(post => new Date(post.scheduled_time) > new Date())
                .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
                .slice(0, 6)
                .map(post => (
                  <Card key={post.id} className="border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-black text-lg mb-1">{post.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{post.content}</p>
                        </div>
                        <Badge className={`${getStatusColor(post.status)} text-white ml-2`}>
                          {post.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {new Date(post.scheduled_time).toLocaleDateString()} at{' '}
                            {new Date(post.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          {post.platforms.map(platform => (
                            <div key={platform} className={`w-6 h-6 rounded-full ${getPlatformColor(platform)} flex items-center justify-center`}>
                              {getPlatformIcon(platform)}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {post.engagement_prediction && (
                        <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700 font-medium">Predicted Engagement</span>
                            <span className="text-green-800 font-bold">{post.engagement_prediction}%</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}