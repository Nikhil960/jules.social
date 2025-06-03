"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { 
  MessageSquare,
  Send,
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ChevronLeft,
  Settings,
  Bot,
  Zap,
  Users,
  TrendingUp,
  Eye
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  platform: string
  sender_name: string
  sender_username: string
  sender_avatar?: string
  content: string
  timestamp: string
  is_read: boolean
  is_starred: boolean
  is_replied: boolean
  message_type: 'dm' | 'comment' | 'mention' | 'review'
  post_context?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  priority: 'high' | 'medium' | 'low'
}

interface AutoResponse {
  id: string
  platform: string
  trigger_keywords: string[]
  response_message: string
  is_active: boolean
  created_at: string
}

interface MessageStats {
  total_messages: number
  unread_messages: number
  response_rate: number
  avg_response_time: string
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([])
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string>("")
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [isAutoResponseDialogOpen, setIsAutoResponseDialogOpen] = useState(false)
  const [newAutoResponse, setNewAutoResponse] = useState({
    platform: '',
    trigger_keywords: '',
    response_message: '',
    is_active: true
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
    fetchMessages(storedToken)
    fetchAutoResponses(storedToken)
    fetchMessageStats(storedToken)
  }, [router])

  const fetchMessages = async (authToken: string) => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockMessages: Message[] = [
        {
          id: '1',
          platform: 'Instagram',
          sender_name: 'Sarah Johnson',
          sender_username: '@sarahj_design',
          content: 'Love your latest post! Where did you get that amazing backdrop?',
          timestamp: '2024-01-22T10:30:00',
          is_read: false,
          is_starred: false,
          is_replied: false,
          message_type: 'comment',
          post_context: 'Behind the scenes of our latest campaign...',
          sentiment: 'positive',
          priority: 'medium'
        },
        {
          id: '2',
          platform: 'X',
          sender_name: 'Mike Chen',
          sender_username: '@mikechen_dev',
          content: 'Hey! I\'m interested in your services. Can you DM me with pricing info?',
          timestamp: '2024-01-22T09:15:00',
          is_read: false,
          is_starred: true,
          is_replied: false,
          message_type: 'dm',
          sentiment: 'positive',
          priority: 'high'
        },
        {
          id: '3',
          platform: 'LinkedIn',
          sender_name: 'Emma Wilson',
          sender_username: 'emma-wilson-marketing',
          content: 'Great insights in your latest article! Would love to collaborate on a project.',
          timestamp: '2024-01-22T08:45:00',
          is_read: true,
          is_starred: false,
          is_replied: true,
          message_type: 'dm',
          sentiment: 'positive',
          priority: 'high'
        },
        {
          id: '4',
          platform: 'Instagram',
          sender_name: 'Alex Rodriguez',
          sender_username: '@alexr_photo',
          content: 'Thanks for mentioning our studio in your story! 🙏',
          timestamp: '2024-01-21T16:20:00',
          is_read: true,
          is_starred: false,
          is_replied: false,
          message_type: 'mention',
          sentiment: 'positive',
          priority: 'low'
        },
        {
          id: '5',
          platform: 'YouTube',
          sender_name: 'Jessica Park',
          sender_username: '@jessicap_vlogs',
          content: 'The audio quality in your latest video seems a bit off. Just thought you should know!',
          timestamp: '2024-01-21T14:10:00',
          is_read: false,
          is_starred: false,
          is_replied: false,
          message_type: 'comment',
          sentiment: 'neutral',
          priority: 'medium'
        }
      ]
      
      setTimeout(() => {
        setMessages(mockMessages)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setIsLoading(false)
    }
  }

  const fetchAutoResponses = async (authToken: string) => {
    try {
      const mockAutoResponses: AutoResponse[] = [
        {
          id: '1',
          platform: 'Instagram',
          trigger_keywords: ['pricing', 'price', 'cost', 'how much'],
          response_message: 'Thanks for your interest! Please check our website for pricing details or DM us for a custom quote. 😊',
          is_active: true,
          created_at: '2024-01-15T10:00:00'
        },
        {
          id: '2',
          platform: 'Twitter',
          trigger_keywords: ['support', 'help', 'issue', 'problem'],
          response_message: 'Hi! We\'re here to help. Please DM us with more details about your issue and we\'ll get back to you ASAP! 🚀',
          is_active: true,
          created_at: '2024-01-15T10:00:00'
        }
      ]
      
      setAutoResponses(mockAutoResponses)
    } catch (error) {
      console.error("Error fetching auto responses:", error)
    }
  }

  const fetchMessageStats = async (authToken: string) => {
    try {
      const mockStats: MessageStats = {
        total_messages: 156,
        unread_messages: 23,
        response_rate: 94.5,
        avg_response_time: '2h 15m',
        sentiment_breakdown: {
          positive: 78,
          neutral: 18,
          negative: 4
        }
      }
      
      setMessageStats(mockStats)
    } catch (error) {
      console.error("Error fetching message stats:", error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'x': return <Twitter className="h-4 w-4" />
      case 'linkedin': return <Linkedin className="h-4 w-4" />
      case 'youtube': return <Youtube className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'from-purple-500 to-pink-500'
      case 'x': return 'from-black to-gray-800'
      case 'linkedin': return 'from-blue-600 to-blue-800'
      case 'youtube': return 'from-red-500 to-red-700'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      case 'neutral': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'dm': return <MessageSquare className="h-4 w-4" />
      case 'comment': return <Reply className="h-4 w-4" />
      case 'mention': return <Star className="h-4 w-4" />
      case 'review': return <CheckCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const filteredMessages = messages.filter(message => {
    const platformMatch = filterPlatform === 'all' || message.platform.toLowerCase() === filterPlatform.toLowerCase()
    const typeMatch = filterType === 'all' || message.message_type === filterType
    const searchMatch = searchQuery === '' || 
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return platformMatch && typeMatch && searchMatch
  })

  const handleReply = (messageId: string) => {
    // In a real app, this would send the reply via API
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, is_replied: true, is_read: true } : msg
    ))
    setReplyText('')
    setSelectedMessage(null)
  }

  const handleCreateAutoResponse = () => {
    const autoResponse: AutoResponse = {
      id: Date.now().toString(),
      platform: newAutoResponse.platform,
      trigger_keywords: newAutoResponse.trigger_keywords.split(',').map(k => k.trim()),
      response_message: newAutoResponse.response_message,
      is_active: newAutoResponse.is_active,
      created_at: new Date().toISOString()
    }
    
    setAutoResponses(prev => [...prev, autoResponse])
    setNewAutoResponse({
      platform: '',
      trigger_keywords: '',
      response_message: '',
      is_active: true
    })
    setIsAutoResponseDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-2 sm:p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-96 bg-gray-200 rounded-xl"></div>
                <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
              </div>
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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">MESSAGES</h1>
                <p className="text-gray-600">Manage conversations across all platforms</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Dialog open={isAutoResponseDialogOpen} onOpenChange={setIsAutoResponseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                    <Bot className="h-4 w-4 mr-2" />
                    Auto Response
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-4 border-black rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black">Create Auto Response</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Platform</label>
                      <Select value={newAutoResponse.platform} onValueChange={(value) => setNewAutoResponse(prev => ({ ...prev, platform: value }))}>
                        <SelectTrigger className="rounded-xl border-2 border-black">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold mb-2">Trigger Keywords (comma separated)</label>
                      <Input
                        value={newAutoResponse.trigger_keywords}
                        onChange={(e) => setNewAutoResponse(prev => ({ ...prev, trigger_keywords: e.target.value }))}
                        placeholder="pricing, cost, help, support"
                        className="rounded-xl border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold mb-2">Response Message</label>
                      <Textarea
                        value={newAutoResponse.response_message}
                        onChange={(e) => setNewAutoResponse(prev => ({ ...prev, response_message: e.target.value }))}
                        placeholder="Enter your auto response message..."
                        className="rounded-xl border-2 border-black min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newAutoResponse.is_active}
                        onCheckedChange={(checked) => setNewAutoResponse(prev => ({ ...prev, is_active: checked }))}
                      />
                      <label className="text-sm font-medium">Active</label>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleCreateAutoResponse}
                        disabled={!newAutoResponse.platform || !newAutoResponse.trigger_keywords || !newAutoResponse.response_message}
                        className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold flex-1"
                      >
                        Create Auto Response
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAutoResponseDialogOpen(false)}
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
          {/* Stats Overview */}
          {messageStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Messages</p>
                      <p className="text-2xl font-black">{messageStats.total_messages}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unread</p>
                      <p className="text-2xl font-black">{messageStats.unread_messages}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Rate</p>
                      <p className="text-2xl font-black">{messageStats.response_rate}%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-black">{messageStats.avg_response_time}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="inbox" className="w-full">
            <TabsList className="w-full bg-white/50 border-2 border-black rounded-xl p-1 mb-6">
              <TabsTrigger value="inbox" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
                Inbox ({filteredMessages.filter(m => !m.is_read).length})
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
                All Messages
              </TabsTrigger>
              <TabsTrigger value="auto-responses" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
                Auto Responses
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl border-2 border-black"
                  />
                </div>
                
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
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[140px] rounded-xl border-2 border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="dm">Direct Messages</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="mention">Mentions</SelectItem>
                    <SelectItem value="review">Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Messages List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Message List */}
                <div className="lg:col-span-1">
                  <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader>
                      <CardTitle className="text-lg font-black">Messages</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto">
                        {filteredMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-300' : ''
                            } ${!message.is_read ? 'bg-blue-50/30' : ''}`}
                            onClick={() => setSelectedMessage(message)}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={message.sender_avatar} />
                                <AvatarFallback>{message.sender_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-sm truncate">{message.sender_name}</h4>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getPlatformColor(message.platform)} flex items-center justify-center`}>
                                      {getPlatformIcon(message.platform)}
                                    </div>
                                    {!message.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-600 mb-1">@{message.sender_username}</p>
                                <p className="text-sm text-gray-800 truncate mb-2">{message.content}</p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`text-xs px-2 py-0 h-5 ${getSentimentColor(message.sentiment)}`}>
                                      {message.sentiment}
                                    </Badge>
                                    <Badge className={`text-xs px-2 py-0 h-5 ${getPriorityColor(message.priority)}`}>
                                      {message.priority}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2">
                  {selectedMessage ? (
                    <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={selectedMessage.sender_avatar} />
                              <AvatarFallback>{selectedMessage.sender_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-black text-lg">{selectedMessage.sender_name}</h3>
                              <p className="text-gray-600">@{selectedMessage.sender_username}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPlatformColor(selectedMessage.platform)} text-white text-sm font-bold flex items-center gap-1`}>
                              {getPlatformIcon(selectedMessage.platform)}
                              {selectedMessage.platform}
                            </div>
                            <Badge className={`${getSentimentColor(selectedMessage.sentiment)}`}>
                              {selectedMessage.sentiment}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            {getMessageTypeIcon(selectedMessage.message_type)}
                            <span className="font-bold text-sm capitalize">{selectedMessage.message_type}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(selectedMessage.timestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          {selectedMessage.post_context && (
                            <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                              <p className="text-sm text-blue-800">Context: {selectedMessage.post_context}</p>
                            </div>
                          )}
                          
                          <p className="text-gray-800">{selectedMessage.content}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="block text-sm font-bold">Reply</label>
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="rounded-xl border-2 border-black min-h-[100px]"
                          />
                          
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleReply(selectedMessage.id)}
                              disabled={!replyText.trim()}
                              className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold flex-1"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Reply
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="rounded-xl border-2 border-black font-bold"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="rounded-xl border-2 border-black font-bold"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <CardContent className="p-12 text-center">
                        <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-black mb-2">Select a Message</h3>
                        <p className="text-gray-600">Choose a message from the list to view details and reply</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all">
              <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="text-xl font-black">All Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="p-4 border-2 border-black rounded-xl bg-white/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={message.sender_avatar} />
                              <AvatarFallback>{message.sender_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold">{message.sender_name}</h4>
                                <span className="text-sm text-gray-600">@{message.sender_username}</span>
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getPlatformColor(message.platform)} flex items-center justify-center`}>
                                  {getPlatformIcon(message.platform)}
                                </div>
                              </div>
                              
                              <p className="text-gray-800 mb-2">{message.content}</p>
                              
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${getSentimentColor(message.sentiment)}`}>
                                  {message.sentiment}
                                </Badge>
                                <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                                  {message.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {message.is_replied && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {message.is_starred && <Star className="h-4 w-4 text-yellow-500" />}
                            {!message.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auto-responses">
              <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="text-xl font-black">Auto Response Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {autoResponses.map((response) => (
                      <div key={response.id} className="p-4 border-2 border-black rounded-xl bg-white/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getPlatformColor(response.platform)} flex items-center justify-center`}>
                                {getPlatformIcon(response.platform)}
                              </div>
                              <h4 className="font-bold">{response.platform}</h4>
                              <Badge className={response.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {response.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-600">Triggers:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {response.trigger_keywords.map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-600">Response:</p>
                              <p className="text-sm text-gray-800 mt-1">{response.response_message}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-black">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {messageStats && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Positive</span>
                          <div className="flex items-center gap-2 flex-1 ml-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${messageStats.sentiment_breakdown.positive}%` }}></div>
                            </div>
                            <span className="font-bold text-sm w-12">{messageStats.sentiment_breakdown.positive}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Neutral</span>
                          <div className="flex items-center gap-2 flex-1 ml-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${messageStats.sentiment_breakdown.neutral}%` }}></div>
                            </div>
                            <span className="font-bold text-sm w-12">{messageStats.sentiment_breakdown.neutral}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Negative</span>
                          <div className="flex items-center gap-2 flex-1 ml-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${messageStats.sentiment_breakdown.negative}%` }}></div>
                            </div>
                            <span className="font-bold text-sm w-12">{messageStats.sentiment_breakdown.negative}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-black">Message Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['dm', 'comment', 'mention', 'review'].map(type => {
                        const count = messages.filter(m => m.message_type === type).length
                        const percentage = (count / messages.length) * 100
                        
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getMessageTypeIcon(type)}
                              <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 ml-4">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="font-bold text-sm w-12">{count}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}