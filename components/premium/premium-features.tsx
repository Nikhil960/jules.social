"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Crown,
  Zap,
  Users,
  BarChart3,
  Calendar,
  Bot,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
  Globe,
  Download,
  Upload,
  Settings,
  CheckCircle,
  Star,
  Rocket,
  Brain,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Filter,
  PieChart,
  LineChart,
  BarChart,
  Activity
} from "lucide-react"

interface PremiumFeature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'analytics' | 'automation' | 'collaboration' | 'content' | 'reporting'
  isPremium: boolean
  isActive?: boolean
}

interface AnalyticsData {
  metric: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatar?: string
  lastActive: string
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  isActive: boolean
  executions: number
}

export default function PremiumFeatures() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics',
      description: 'Deep insights with competitor analysis, audience demographics, and ROI tracking',
      icon: <BarChart3 className="h-6 w-6" />,
      category: 'analytics',
      isPremium: true,
      isActive: true
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      description: 'Multi-user access with role-based permissions and approval workflows',
      icon: <Users className="h-6 w-6" />,
      category: 'collaboration',
      isPremium: true,
      isActive: true
    },
    {
      id: 'ai-content-optimization',
      title: 'AI Content Optimization',
      description: 'AI-powered content suggestions, optimal posting times, and hashtag recommendations',
      icon: <Brain className="h-6 w-6" />,
      category: 'content',
      isPremium: true,
      isActive: false
    },
    {
      id: 'automated-responses',
      title: 'Smart Auto-Responses',
      description: 'Intelligent chatbots with sentiment analysis and personalized responses',
      icon: <Bot className="h-6 w-6" />,
      category: 'automation',
      isPremium: true,
      isActive: true
    },
    {
      id: 'white-label-reports',
      title: 'White-Label Reports',
      description: 'Branded PDF reports with custom logos and client-specific insights',
      icon: <Download className="h-6 w-6" />,
      category: 'reporting',
      isPremium: true,
      isActive: false
    },
    {
      id: 'competitor-tracking',
      title: 'Competitor Analysis',
      description: 'Track competitor performance, content strategies, and market positioning',
      icon: <Target className="h-6 w-6" />,
      category: 'analytics',
      isPremium: true,
      isActive: true
    },
    {
      id: 'bulk-scheduling',
      title: 'Bulk Content Upload',
      description: 'Upload and schedule hundreds of posts with CSV import and batch editing',
      icon: <Upload className="h-6 w-6" />,
      category: 'content',
      isPremium: true,
      isActive: true
    },
    {
      id: 'custom-integrations',
      title: 'Custom Integrations',
      description: 'Connect with CRM, email marketing, and other business tools via API',
      icon: <Globe className="h-6 w-6" />,
      category: 'automation',
      isPremium: true,
      isActive: false
    }
  ]

  const analyticsData: AnalyticsData[] = [
    {
      metric: 'Total Reach',
      value: '2.4M',
      change: '+15.3%',
      trend: 'up',
      icon: <Eye className="h-5 w-5" />
    },
    {
      metric: 'Engagement Rate',
      value: '8.7%',
      change: '+2.1%',
      trend: 'up',
      icon: <Heart className="h-5 w-5" />
    },
    {
      metric: 'Click-Through Rate',
      value: '3.2%',
      change: '-0.5%',
      trend: 'down',
      icon: <Activity className="h-5 w-5" />
    },
    {
      metric: 'Conversion Rate',
      value: '2.8%',
      change: '+0.8%',
      trend: 'up',
      icon: <Target className="h-5 w-5" />
    },
    {
      metric: 'ROI',
      value: '340%',
      change: '+25%',
      trend: 'up',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      metric: 'Cost Per Click',
      value: '$0.45',
      change: '-12%',
      trend: 'up',
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'admin',
      lastActive: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'editor',
      lastActive: '1 hour ago'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma@company.com',
      role: 'viewer',
      lastActive: '3 hours ago'
    }
  ]

  const automationRules: AutomationRule[] = [
    {
      id: '1',
      name: 'Welcome New Followers',
      trigger: 'New follower on Instagram',
      action: 'Send welcome DM with discount code',
      isActive: true,
      executions: 156
    },
    {
      id: '2',
      name: 'Engagement Boost',
      trigger: 'Post receives 100+ likes',
      action: 'Share to X and LinkedIn',
      isActive: true,
      executions: 23
    },
    {
      id: '3',
      name: 'Crisis Management',
      trigger: 'Negative sentiment detected',
      action: 'Alert team and suggest response',
      isActive: false,
      executions: 8
    }
  ]

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black">PREMIUM FEATURES</h2>
                <p className="text-white/80">Unlock advanced tools for professional social media management</p>
              </div>
            </div>
            
            <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-purple-600 hover:bg-white/90 rounded-xl border-2 border-white font-bold">
                  <Rocket className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl border-4 border-black rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Choose Your Plan</DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Starter Plan */}
                  <Card className="border-2 border-gray-300 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-center">
                        <div className="text-lg font-bold">Starter</div>
                        <div className="text-3xl font-black mt-2">$29<span className="text-sm font-normal">/month</span></div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">5 Social Accounts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Basic Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Content Scheduling</span>
                      </div>
                      <Button className="w-full mt-4 rounded-xl border-2 border-black font-bold">
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Professional Plan */}
                  <Card className="border-4 border-purple-500 rounded-xl relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-center">
                        <div className="text-lg font-bold">Professional</div>
                        <div className="text-3xl font-black mt-2">$79<span className="text-sm font-normal">/month</span></div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">25 Social Accounts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Advanced Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Team Collaboration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">AI Content Optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">White-Label Reports</span>
                      </div>
                      <Button className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl border-2 border-purple-500 font-bold">
                        Upgrade Now
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Enterprise Plan */}
                  <Card className="border-2 border-gray-300 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-center">
                        <div className="text-lg font-bold">Enterprise</div>
                        <div className="text-3xl font-black mt-2">$199<span className="text-sm font-normal">/month</span></div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Unlimited Accounts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Custom Integrations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Priority Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Dedicated Account Manager</span>
                      </div>
                      <Button className="w-full mt-4 rounded-xl border-2 border-black font-bold">
                        Contact Sales
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/50 border-2 border-black rounded-xl p-1 mb-6">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            Team
          </TabsTrigger>
          <TabsTrigger value="automation" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature) => (
              <Card key={feature.id} className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                      {feature.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {feature.isPremium && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {feature.isActive !== undefined && (
                        <Switch checked={feature.isActive} className="scale-75" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-black text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  
                  <Badge variant="outline" className="text-xs">
                    {feature.category.charAt(0).toUpperCase() + feature.category.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.map((data, index) => (
              <Card key={index} className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
                      {data.icon}
                    </div>
                    {getTrendIcon(data.trend)}
                  </div>
                  
                  <h3 className="font-bold text-sm text-gray-600 mb-1">{data.metric}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{data.value}</span>
                    <span className={`text-sm font-bold ${
                      data.trend === 'up' ? 'text-green-600' : 
                      data.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {data.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Competitor Analysis */}
          <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Target className="h-6 w-6" />
                Competitor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['@competitor1', '@competitor2', '@competitor3'].map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border-2 border-black rounded-xl bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                        {competitor.charAt(1).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold">{competitor}</h4>
                        <p className="text-sm text-gray-600">Engagement: {(Math.random() * 10).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{(Math.random() * 100 + 50).toFixed(0)}K</p>
                        <p className="text-sm text-gray-600">Followers</p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Team Management */}
          <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Team Members
                </CardTitle>
                <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border-2 border-black rounded-xl bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Last active</p>
                        <p className="text-sm font-medium">{member.lastActive}</p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval Workflow */}
          <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-2 border-yellow-400 rounded-xl bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">Post awaiting approval</h4>
                      <p className="text-sm text-gray-600">"New product launch announcement..."</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted by Mike Chen • 2 hours ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-2 border-green-400 rounded-xl bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">Post approved</h4>
                      <p className="text-sm text-gray-600">"Behind the scenes of our latest campaign..."</p>
                      <p className="text-xs text-gray-500 mt-1">Approved by Sarah Johnson • 1 day ago</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {/* Automation Rules */}
          <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  Automation Rules
                </CardTitle>
                <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="p-4 border-2 border-black rounded-xl bg-white/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold">{rule.name}</h4>
                          <Switch checked={rule.isActive} className="scale-75" />
                          <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Trigger:</span> {rule.trigger}</p>
                          <p><span className="font-medium">Action:</span> {rule.action}</p>
                          <p><span className="font-medium">Executions:</span> {rule.executions} times</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg border border-black font-bold">
                          <BarChart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Content Suggestions */}
          <Card className="border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                AI Content Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-2 border-purple-400 rounded-xl bg-purple-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">Trending Topic Alert</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        "Sustainable fashion" is trending in your industry. Consider creating content around eco-friendly practices.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">#SustainableFashion</Badge>
                        <Badge variant="outline" className="text-xs">#EcoFriendly</Badge>
                        <Badge variant="outline" className="text-xs">#GreenLiving</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold">
                      Create Post
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border-2 border-blue-400 rounded-xl bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">Optimal Posting Time</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Your audience is most active on Instagram at 7:00 PM today. Schedule your next post for maximum engagement.
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Today at 7:00 PM</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold">
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}