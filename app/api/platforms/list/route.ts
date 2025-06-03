/**
 * API Route: /api/platforms/list
 * 
 * Returns a list of all supported social media platforms with their display information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PlatformFactory } from '@/lib/platforms/platform-factory';

export async function GET(request: NextRequest) {
  try {
    // Get all supported platforms
    const platforms = PlatformFactory.getSupportedPlatforms();
    
    // Platform display information
    const platformInfo: Record<string, any> = {
      facebook: {
        name: 'Facebook',
        description: 'Connect with friends, family and other people you know. Share photos and videos, send messages and get updates.',
        icon: 'facebook',
        color: 'bg-blue-600',
        features: ['posts', 'photos', 'videos', 'stories', 'groups']
      },
      instagram: {
        name: 'Instagram',
        description: 'A simple, fun & creative way to capture, edit & share photos, videos & messages with friends & family.',
        icon: 'instagram',
        color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
        features: ['photos', 'videos', 'stories', 'reels', 'direct messages']
      },
      x: {
    name: 'X',
    description: 'See what's happening in the world right now. Join X today.',
    icon: 'x',
        color: 'bg-sky-500',
        features: ['tweets', 'retweets', 'likes', 'polls', 'threads']
      },
      linkedin: {
        name: 'LinkedIn',
        description: 'Manage your professional identity. Build and engage with your professional network.',
        icon: 'linkedin',
        color: 'bg-blue-700',
        features: ['posts', 'articles', 'jobs', 'networking', 'professional groups']
      },
      tiktok: {
        name: 'TikTok',
        description: 'TikTok is the leading destination for short-form mobile video.',
        icon: 'tiktok',
        color: 'bg-black',
        features: ['short videos', 'duets', 'challenges', 'effects', 'sounds']
      },
      pinterest: {
        name: 'Pinterest',
        description: 'Discover recipes, home ideas, style inspiration and other ideas to try.',
        icon: 'pinterest',
        color: 'bg-red-600',
        features: ['pins', 'boards', 'shopping', 'ideas', 'inspiration']
      }
    };
    
    // Map platforms to their display information
    const result = platforms.map(platform => ({
      id: platform,
      ...platformInfo[platform]
    }));
    
    return NextResponse.json({ platforms: result });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}