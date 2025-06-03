"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Instagram, Twitter as X, Linkedin, Youtube, Calendar, Send, Sparkles, Hash, Loader2 } from "lucide-react"

interface PostComposerProps {
  token: string
  onPostCreated?: () => void
}

export default function PostComposer({ token, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [platforms, setPlatforms] = useState<string[]>(["instagram"])
  const [hashtags, setHashtags] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [postType, setPostType] = useState("post")
  const [optimizeWithAI, setOptimizeWithAI] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false)
  const [message, setMessage] = useState("")

  const platformOptions = [
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="h-4 w-4" />,
      color: "from-purple-500 to-pink-500",
    },
    { id: "x", name: "X", icon: <X className="h-4 w-4" />, color: "from-black to-gray-800" },
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="h-4 w-4" />, color: "from-blue-600 to-blue-800" },
    { id: "youtube", name: "YouTube", icon: <Youtube className="h-4 w-4" />, color: "from-red-500 to-red-700" },
  ]

  const togglePlatform = (platformId: string) => {
    setPlatforms((prev) => (prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]))
  }

  const generateHashtags = async () => {
    if (!content.trim()) return

    setIsGeneratingHashtags(true)
    try {
      const response = await fetch("/api/ai/hashtags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          platform: platforms[0] || "instagram",
        }),
      })

      const data = await response.json()
      if (data.success) {
        setHashtags(data.hashtags.join(" "))
      }
    } catch (error) {
      console.error("Error generating hashtags:", error)
    } finally {
      setIsGeneratingHashtags(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || platforms.length === 0) return

    setIsLoading(true)
    setMessage("")

    try {
      const scheduledAt = scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}:00.000Z` : null

      const hashtagArray = hashtags
        .split(" ")
        .filter((tag) => tag.trim().startsWith("#"))
        .map((tag) => tag.trim())

      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          platforms,
          hashtags: hashtagArray,
          scheduled_at: scheduledAt,
          post_type: postType,
          optimize_with_ai: optimizeWithAI,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage(scheduledAt ? "Post scheduled successfully!" : "Post saved as draft!")
        setContent("")
        setHashtags("")
        setScheduledDate("")
        setScheduledTime("")
        onPostCreated?.()
      } else {
        setMessage(data.error || "Failed to create post")
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const characterCount = content.length
  const maxCharacters = platforms.includes("x") ? 280 : 2200

  return (
    <Card className="border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-black mb-4">CREATE POST</h3>

      {message && (
        <Alert className="mb-4 border-2 border-black">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content */}
        <div>
          <Label className="font-bold mb-2 block">Content</Label>
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] border-2 border-black rounded-xl resize-none"
            maxLength={maxCharacters}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${characterCount > maxCharacters * 0.9 ? "text-red-500" : "text-gray-500"}`}>
              {characterCount}/{maxCharacters}
            </span>
            <div className="flex items-center gap-2">
              <Switch id="ai-optimize" checked={optimizeWithAI} onCheckedChange={setOptimizeWithAI} />
              <Label htmlFor="ai-optimize" className="text-sm font-medium">
                <Sparkles className="h-4 w-4 inline mr-1" />
                AI Optimize
              </Label>
            </div>
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="font-bold">Hashtags</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateHashtags}
              disabled={!content.trim() || isGeneratingHashtags}
              className="border-2 border-black rounded-xl"
            >
              {isGeneratingHashtags ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
              Generate
            </Button>
          </div>
          <Textarea
            placeholder="#hashtag #example #socialmedia"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="border-2 border-black rounded-xl"
            rows={2}
          />
        </div>

        {/* Platforms */}
        <div>
          <Label className="font-bold mb-3 block">Platforms</Label>
          <div className="grid grid-cols-2 gap-3">
            {platformOptions.map((platform) => (
              <div
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`p-3 border-2 border-black rounded-xl cursor-pointer transition-all ${
                  platforms.includes(platform.id)
                    ? `bg-gradient-to-r ${platform.color} text-white`
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {platform.icon}
                  <span className="font-bold text-sm">{platform.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Type & Scheduling */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="font-bold mb-2 block">Post Type</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger className="border-2 border-black rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-bold mb-2 block">Schedule Date</Label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full p-2 border-2 border-black rounded-xl"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <Label className="font-bold mb-2 block">Schedule Time</Label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full p-2 border-2 border-black rounded-xl"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !content.trim() || platforms.length === 0}
          className="w-full bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : scheduledDate && scheduledTime ? (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Post
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Save Draft
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
