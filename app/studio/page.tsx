"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Palette,
  Image,
  Video,
  Music,
  Type,
  Sparkles,
  Download,
  Upload,
  Copy,
  Share2,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  Wand2,
  Layers,
  Filter,
  Crop,
  RotateCw,
  Zap,
  Crown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  PlusCircle,
  Trash2,
  Settings,
  Save,
  Grid3X3,
  Square,
  Circle,
  Triangle,
  Star,
  Hash,
  AtSign,
  Calendar,
  Clock,
  FileText
} from "lucide-react"
import Link from "next/link"

interface Template {
  id: string
  name: string
  category: 'post' | 'story' | 'reel' | 'carousel'
  platform: string
  thumbnail: string
  isPremium: boolean
  dimensions: string
  tags: string[]
}

interface AITool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'text' | 'image' | 'video' | 'audio'
  isPremium: boolean
}

interface Project {
  id: string
  name: string
  type: 'image' | 'video' | 'carousel'
  platform: string
  thumbnail: string
  lastModified: string
  status: 'draft' | 'completed' | 'scheduled'
}

export default function StudioPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string>("")
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
  const [selectedAITool, setSelectedAITool] = useState<AITool | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem("postcraft_token")
    const storedUser = localStorage.getItem("postcraft_user")

    if (!storedToken || !storedUser) {
      router.push("/login")
      return
    }

    setToken(storedToken)
    setUser(JSON.parse(storedUser))
  }, [router])

  const studioOptions = [
    {
      type: "audio",
      name: "Audio Studio",
      description: "Mix, master, and edit audio content with AI assistance",
      icon: <Music className="h-8 w-8 sm:h-10 sm:w-10" />,
      color: "bg-gradient-to-br from-pink-500 to-orange-500",
      href: "/studio/audio",
    },
    {
      type: "video",
      name: "Video Studio",
      description: "Edit, trim, and enhance video content with AI tools",
      icon: <Video className="h-8 w-8 sm:h-10 sm:w-10" />,
      color: "bg-gradient-to-br from-blue-500 to-purple-500",
      href: "/studio/video",
    },
    {
      type: "image",
      name: "Image Studio",
      description: "Edit and enhance images with AI-powered features",
      icon: <Image className="h-8 w-8 sm:h-10 sm:w-10" />,
      color: "bg-gradient-to-br from-green-500 to-teal-500",
      href: "/studio/image",
    },
    {
      type: "text",
      name: "Text Studio",
      description: "Create and optimize text content with AI assistance",
      icon: <FileText className="h-8 w-8 sm:h-10 sm:w-10" />,
      color: "bg-gradient-to-br from-yellow-500 to-amber-500",
      href: "/studio/text",
    },
  ]

  const templates: Template[] = [
    {
      id: '1',
      name: 'Modern Quote Card',
      category: 'post',
      platform: 'Instagram',
      thumbnail: '/api/placeholder/300/300',
      isPremium: false,
      dimensions: '1080x1080',
      tags: ['quote', 'minimal', 'modern']
    },
    {
      id: '2',
      name: 'Product Showcase',
      category: 'post',
      platform: 'Instagram',
      thumbnail: '/api/placeholder/300/300',
      isPremium: true,
      dimensions: '1080x1080',
      tags: ['product', 'ecommerce', 'showcase']
    },
    {
      id: '3',
      name: 'Story Template',
      category: 'story',
      platform: 'Instagram',
      thumbnail: '/api/placeholder/300/400',
      isPremium: false,
      dimensions: '1080x1920',
      tags: ['story', 'vertical', 'mobile']
    },
    {
      id: '4',
      name: 'Video Reel Template',
      category: 'reel',
      platform: 'Instagram',
      thumbnail: '/api/placeholder/300/400',
      isPremium: true,
      dimensions: '1080x1920',
      tags: ['video', 'reel', 'dynamic']
    },
    {
      id: '5',
      name: 'Carousel Design',
      category: 'carousel',
      platform: 'Instagram',
      thumbnail: '/api/placeholder/300/300',
      isPremium: true,
      dimensions: '1080x1080',
      tags: ['carousel', 'swipe', 'multi']
    },
    {
      id: '6',
      name: 'LinkedIn Post',
      category: 'post',
      platform: 'LinkedIn',
      thumbnail: '/api/placeholder/300/200',
      isPremium: false,
      dimensions: '1200x627',
      tags: ['professional', 'business', 'linkedin']
    }
  ]

  const aiTools: AITool[] = [
    {
      id: 'text-generator',
      name: 'AI Text Generator',
      description: 'Generate engaging captions and copy with AI',
      icon: <Type className="h-6 w-6" />,
      category: 'text',
      isPremium: false
    },
    {
      id: 'hashtag-generator',
      name: 'Smart Hashtags',
      description: 'Generate relevant hashtags for maximum reach',
      icon: <Hash className="h-6 w-6" />,
      category: 'text',
      isPremium: false
    },
    {
      id: 'image-enhancer',
      name: 'AI Image Enhancer',
      description: 'Enhance image quality and apply smart filters',
      icon: <Sparkles className="h-6 w-6" />,
      category: 'image',
      isPremium: true
    },
    {
      id: 'background-remover',
      name: 'Background Remover',
      description: 'Remove backgrounds from images automatically',
      icon: <Layers className="h-6 w-6" />,
      category: 'image',
      isPremium: true
    },
    {
      id: 'video-editor',
      name: 'AI Video Editor',
      description: 'Auto-edit videos with smart cuts and transitions',
      icon: <Video className="h-6 w-6" />,
      category: 'video',
      isPremium: true
    },
    {
      id: 'audio-generator',
      name: 'AI Music Generator',
      description: 'Generate background music for your content',
      icon: <Music className="h-6 w-6" />,
      category: 'audio',
      isPremium: true
    }
  ]

  const projects: Project[] = [
    {
      id: '1',
      name: 'Summer Campaign Post',
      type: 'image',
      platform: 'Instagram',
      thumbnail: '/api/placeholder/200/200',
      lastModified: '2 hours ago',
      status: 'draft'
    },
    {
      id: '2',
      name: 'Product Launch Video',
      type: 'video',
      platform: 'YouTube',
      thumbnail: '/api/placeholder/200/150',
      lastModified: '1 day ago',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Feature Carousel',
      type: 'carousel',
      platform: 'Instagram',
      thumbnail: '/api/placeholder/200/200',
      lastModified: '3 days ago',
      status: 'scheduled'
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory
    const platformMatch = selectedPlatform === 'all' || template.platform.toLowerCase() === selectedPlatform.toLowerCase()
    const searchMatch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return categoryMatch && platformMatch && searchMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAIGenerate = async () => {
    if (!selectedAITool || !aiPrompt.trim()) return
    
    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false)
      setIsAIDialogOpen(false)
      setAiPrompt('')
      setSelectedAITool(null)
      // In a real app, this would generate actual content
    }, 3000)
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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">CONTENT STUDIO</h1>
                <p className="text-gray-600">Create stunning content with AI-powered tools</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl border-2 border-black font-bold">
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI Tools
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl border-4 border-black rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black">AI Content Tools</DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {aiTools.map((tool) => (
                      <Card 
                        key={tool.id} 
                        className={`border-2 border-black rounded-xl cursor-pointer transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                          selectedAITool?.id === tool.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => setSelectedAITool(tool)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
                              {tool.icon}
                            </div>
                            {tool.isPremium && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-bold text-sm mb-1">{tool.name}</h3>
                          <p className="text-xs text-gray-600">{tool.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {selectedAITool && (
                    <div className="mt-6 p-4 border-2 border-purple-300 rounded-xl bg-purple-50">
                      <h4 className="font-bold mb-3">{selectedAITool.name}</h4>
                      <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder={`Describe what you want to create with ${selectedAITool.name}...`}
                        className="rounded-xl border-2 border-black mb-4"
                        rows={3}
                      />
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAIGenerate}
                          disabled={!aiPrompt.trim() || isGenerating}
                          className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl border-2 border-black font-bold flex-1"
                        >
                          {isGenerating ? (
                            <>
                              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedAITool(null)
                            setAiPrompt('')
                          }}
                          className="rounded-xl border-2 border-black font-bold"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-white/50 border-2 border-black rounded-xl p-1 mb-6 overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold whitespace-nowrap">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold whitespace-nowrap">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="projects" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold whitespace-nowrap">
                <Bookmark className="h-4 w-4 mr-2" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="editor" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold whitespace-nowrap">
                <Palette className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="assets" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold whitespace-nowrap">
                <Image className="h-4 w-4 mr-2" />
                Assets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div>
                <h2 className="text-2xl font-black mb-6">SELECT A STUDIO</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {studioOptions.map((studio) => (
                    <Link href={studio.href} key={studio.type} className="block">
                      <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-y-[-4px] transition-transform h-full">
                        <div className={`p-4 sm:p-6 text-white ${studio.color}`}>
                          {studio.icon}
                          <h3 className="text-lg sm:text-xl font-bold mt-4">{studio.name}</h3>
                        </div>
                        <div className="p-4 bg-white">
                          <p className="text-sm sm:text-base">{studio.description}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border-2 border-black"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[140px] rounded-xl border-2 border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="story">Stories</SelectItem>
                    <SelectItem value="reel">Reels</SelectItem>
                    <SelectItem value="carousel">Carousels</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
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
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-6xl text-gray-400">
                          {template.category === 'post' && <Square className="h-16 w-16" />}
                          {template.category === 'story' && <div className="w-12 h-20 border-4 border-gray-400 rounded-lg" />}
                          {template.category === 'reel' && <Play className="h-16 w-16" />}
                          {template.category === 'carousel' && <Grid3X3 className="h-16 w-16" />}
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 flex gap-2">
                        {template.isPremium && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-white/90">
                          {template.platform}
                        </Badge>
                      </div>
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-lg font-bold">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" className="bg-black text-white hover:bg-black/80 rounded-lg font-bold">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-2">{template.name}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>{template.dimensions}</span>
                        <span className="capitalize">{template.category}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-4xl text-gray-400">
                          {project.type === 'image' && <Image className="h-12 w-12" />}
                          {project.type === 'video' && <Video className="h-12 w-12" />}
                          {project.type === 'carousel' && <Grid3X3 className="h-12 w-12" />}
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-lg font-bold">
                            <Eye className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/90 rounded-lg font-bold">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-2">{project.name}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{project.platform}</span>
                        <span>{project.lastModified}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                    {/* Tools Panel */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="font-black text-lg mb-4">Tools</h3>
                      
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start rounded-xl border-2 border-black font-bold">
                          <Type className="h-4 w-4 mr-2" />
                          Text
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl border-2 border-black font-bold">
                          <Image className="h-4 w-4 mr-2" />
                          Image
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl border-2 border-black font-bold">
                          <Square className="h-4 w-4 mr-2" />
                          Shapes
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl border-2 border-black font-bold">
                          <Palette className="h-4 w-4 mr-2" />
                          Background
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl border-2 border-black font-bold">
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                        </Button>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-bold mb-2">AI Tools</h4>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start rounded-xl border-2 border-purple-300 font-bold text-purple-600">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Enhance
                          </Button>
                          <Button variant="outline" className="w-full justify-start rounded-xl border-2 border-purple-300 font-bold text-purple-600">
                            <Layers className="h-4 w-4 mr-2" />
                            Remove BG
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Canvas */}
                    <div className="lg:col-span-2">
                      <div className="aspect-square bg-white border-4 border-black rounded-xl flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Palette className="h-16 w-16 mx-auto mb-4" />
                          <p className="text-lg font-bold">Canvas</p>
                          <p className="text-sm">Start creating your design</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Properties Panel */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="font-black text-lg mb-4">Properties</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-2">Size</label>
                          <Select defaultValue="1080x1080">
                            <SelectTrigger className="rounded-xl border-2 border-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1080x1080">Instagram Post (1080x1080)</SelectItem>
                              <SelectItem value="1080x1920">Instagram Story (1080x1920)</SelectItem>
                              <SelectItem value="1200x627">Facebook Post (1200x627)</SelectItem>
                              <SelectItem value="1024x512">X Header (1024x512)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold mb-2">Background Color</label>
                          <div className="flex gap-2">
                            <div className="w-8 h-8 bg-white border-2 border-black rounded cursor-pointer"></div>
                            <div className="w-8 h-8 bg-black border-2 border-black rounded cursor-pointer"></div>
                            <div className="w-8 h-8 bg-red-500 border-2 border-black rounded cursor-pointer"></div>
                            <div className="w-8 h-8 bg-blue-500 border-2 border-black rounded cursor-pointer"></div>
                            <div className="w-8 h-8 bg-green-500 border-2 border-black rounded cursor-pointer"></div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold mb-2">Opacity</label>
                          <Slider defaultValue={[100]} max={100} step={1} className="w-full" />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button className="bg-green-500 hover:bg-green-600 text-white rounded-xl border-2 border-black font-bold flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Area */}
                <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-black">Upload Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-bold mb-2">Drop files here</p>
                      <p className="text-sm text-gray-600 mb-4">or click to browse</p>
                      <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                        Choose Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Asset Library */}
                <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-black">Asset Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-md transition-all">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      ))}
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
