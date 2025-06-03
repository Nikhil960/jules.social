/**
 * API Route: /api/platforms/post-requirements
 * 
 * Returns the posting requirements and limitations for a specific platform or all supported platforms.
 * This endpoint is used by the frontend to validate post content before submission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PlatformFactory } from '@/lib/platforms/platform-factory';

// Platform-specific posting requirements
const postRequirements: Record<string, any> = {
  facebook: {
    maxContentLength: 63206,
    maxMediaItems: 10,
    supportedMediaTypes: ['image', 'video', 'link'],
    requiresMedia: false,
    characterLimit: 63206,
    hashtagLimit: 30,
    recommendedHashtagCount: 2,
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'gif'],
      video: ['mp4', 'mov'],
      aspectRatios: ['landscape', 'square', 'portrait']
    }
  },
  instagram: {
    maxContentLength: 2200,
    maxMediaItems: 10,
    supportedMediaTypes: ['image', 'video'],
    requiresMedia: true,
    characterLimit: 2200,
    hashtagLimit: 30,
    recommendedHashtagCount: 10,
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png'],
      video: ['mp4', 'mov'],
      aspectRatios: ['square', 'portrait']
    }
  },
  x: {
    maxContentLength: 280,
    maxMediaItems: 4,
    supportedMediaTypes: ['image', 'video', 'gif'],
    requiresMedia: false,
    characterLimit: 280,
    hashtagLimit: 10,
    recommendedHashtagCount: 2,
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'gif'],
      video: ['mp4', 'mov'],
      aspectRatios: ['landscape', 'square']
    }
  },
  linkedin: {
    maxContentLength: 3000,
    maxMediaItems: 9,
    supportedMediaTypes: ['image', 'video', 'document'],
    requiresMedia: false,
    characterLimit: 3000,
    hashtagLimit: 10,
    recommendedHashtagCount: 3,
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png'],
      video: ['mp4'],
      document: ['pdf'],
      aspectRatios: ['landscape', 'square']
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get platform from query parameters
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    
    // If platform is specified, return requirements for that platform
    if (platform) {
      // Validate platform is supported
      if (!PlatformFactory.isPlatformSupported(platform)) {
        return NextResponse.json(
          { error: `Unsupported platform: ${platform}` },
          { status: 400 }
        );
      }
      
      // Get platform-specific requirements
      const requirements = postRequirements[platform.toLowerCase()] || {
        maxContentLength: 1000,
        maxMediaItems: 1,
        supportedMediaTypes: ['image'],
        requiresMedia: false,
        characterLimit: 1000,
        hashtagLimit: 5,
        recommendedHashtagCount: 2,
        supportedFormats: {
          image: ['jpg', 'jpeg', 'png'],
          aspectRatios: ['landscape', 'square']
        }
      };
      
      return NextResponse.json({
        platform,
        requirements
      });
    }
    
    // If no platform specified, return requirements for all supported platforms
    const supportedPlatforms = PlatformFactory.getSupportedPlatforms();
    const allRequirements: Record<string, any> = {};
    
    for (const platform of supportedPlatforms) {
      allRequirements[platform] = postRequirements[platform.toLowerCase()] || {
        maxContentLength: 1000,
        maxMediaItems: 1,
        supportedMediaTypes: ['image'],
        requiresMedia: false,
        characterLimit: 1000,
        hashtagLimit: 5,
        recommendedHashtagCount: 2,
        supportedFormats: {
          image: ['jpg', 'jpeg', 'png'],
          aspectRatios: ['landscape', 'square']
        }
      };
    }
    
    return NextResponse.json({
      platforms: supportedPlatforms,
      requirements: allRequirements
    });
  } catch (error) {
    console.error('Error getting post requirements:', error);
    return NextResponse.json(
      { error: 'Failed to get post requirements', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}