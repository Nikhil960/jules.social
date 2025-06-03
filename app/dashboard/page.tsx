"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Plus, BarChart3, Calendar, MessageSquare, Crown } from "lucide-react"
import AnalyticsOverview from "@/components/dashboard/analytics-overview"
import PostComposer from "@/components/dashboard/post-composer"
import SocialMediaCard from "@/components/social-media-card"
import PremiumFeatures from "@/components/premium/premium-features"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string>("")
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("postcraft_token")
    const storedUser = localStorage.getItem("postcraft_user")

    if (!storedToken || !storedUser) {
      router.push("/login")
      return
    }

    setToken(storedToken)
    setUser(JSON.parse(storedUser))
    fetchAccounts(storedToken)
  }, [router])

  const fetchAccounts = async (authToken: string) => {
    try {
      const response = await fetch("/api/accounts/list", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("postcraft_token")
    localStorage.removeItem("postcraft_user")
    router.push("/login")
  }

  const connectMockAccount = async (platform: string) => {
    try {
      const response = await fetch("/api/accounts/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform,
          auth_code: `mock_code_${Date.now()}`,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setAccounts((prev) => [...prev, data.account])
      }
    } catch (error) {
      console.error("Error connecting account:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden m-4">
        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-white/40 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">POSTCRAFT</h1>
              <p className="text-gray-600">Welcome back, {user?.name || "User"}!</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full bg-white/50 border-2 border-black rounded-xl p-1 mb-6 overflow-x-auto">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex items-center gap-2 whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex items-center gap-2 whitespace-nowrap"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex items-center gap-2 whitespace-nowrap"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="premium"
                className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex items-center gap-2 whitespace-nowrap"
              >
                <Crown className="h-4 w-4" />
                Premium
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Connected Accounts */}
              <div>
                <h2 className="text-xl font-black mb-4">CONNECTED ACCOUNTS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <SocialMediaCard
                      key={account.id}
                      platform={account.platform}
                      username={account.username}
                      icon={
                        account.platform === "instagram"
                          ? "instagram"
                          : account.platform === "x"
              ? "x"
                            : account.platform === "linkedin"
                              ? "linkedin"
                              : "youtube"
                      }
                      color={
                        account.platform === "instagram"
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : account.platform === "twitter"
                            ? "bg-black"
                            : account.platform === "linkedin"
                              ? "bg-blue-600"
                              : "bg-red-500"
                      }
                    />
                  ))}

                  {/* Add Account Cards */}
                  {["instagram", "x", "linkedin", "youtube"].map((platform) => {
                    const isConnected = accounts.some((acc) => acc.platform === platform)
                    if (isConnected) return null

                    return (
                      <Button
                        key={platform}
                        onClick={() => connectMockAccount(platform)}
                        className="h-full min-h-[120px] border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-white/50 hover:bg-white/70 text-black"
                      >
                        <Plus className="h-8 w-8" />
                        <span className="font-bold capitalize">Add {platform}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <AnalyticsOverview token={token} />
            </TabsContent>

            <TabsContent value="create">
              <PostComposer token={token} />
            </TabsContent>

            <TabsContent value="calendar">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Content Calendar</h3>
                <p className="text-gray-600">Coming soon! Plan and schedule your content visually.</p>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Messages & Engagement</h3>
                <p className="text-gray-600">Coming soon! Manage all your social media interactions in one place.</p>
              </div>
            </TabsContent>

            <TabsContent value="premium" className="space-y-6">
              <PremiumFeatures />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
