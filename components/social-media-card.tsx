import React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Icons } from "./icons"

interface SocialMediaCardProps {
  platform: string
  username: string
  icon: React.ReactNode | string
  color: string
  metrics?: {
    followers?: number
    posts?: number
    engagement?: number
  }
}

export function SocialMediaCard({ platform, username, icon, color, metrics }: SocialMediaCardProps) {
  // Handle both React elements and string keys for the icon
  const IconComponent = typeof icon === 'string' 
    ? (icon in Icons ? Icons[icon as keyof typeof Icons] : Icons.question)
    : null;
  
  return (
    <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className={cn("p-4 text-white", color)}>
        <div className="flex justify-between items-center">
          {typeof icon === 'string' && IconComponent ? (
            <IconComponent className="h-6 w-6" />
          ) : (
            React.isValidElement(icon) ? icon : <Icons.question className="h-6 w-6" />
          )}
          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">Connected</span>
        </div>
        <h3 className="text-xl font-bold mt-2 capitalize">{platform}</h3>
        <p className="text-sm opacity-90">{username}</p>
      </div>
      <div className="p-4 bg-white">
        <div className="flex justify-between text-sm">
          <div>
            <p className="font-bold">{metrics?.followers?.toLocaleString() || '0'}</p>
            <p className="text-gray-600">Followers</p>
          </div>
          <div>
            <p className="font-bold">{metrics?.posts?.toLocaleString() || '0'}</p>
            <p className="text-gray-600">Posts</p>
          </div>
          <div>
            <p className="font-bold">{metrics?.engagement?.toLocaleString() || '0'}%</p>
            <p className="text-gray-600">Engagement</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
