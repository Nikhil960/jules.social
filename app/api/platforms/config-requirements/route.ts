/**
 * API Route: /api/platforms/config-requirements
 * 
 * Returns the configuration requirements for a specific platform or all supported platforms.
 * This endpoint is used by the frontend to dynamically render platform-specific configuration forms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PlatformFactory } from '@/lib/platforms/platform-factory';

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
      const requirements = PlatformFactory.getPlatformConfigRequirements(platform);
      
      return NextResponse.json({
        platform,
        requirements
      });
    }
    
    // If no platform specified, return requirements for all supported platforms
    const supportedPlatforms = PlatformFactory.getSupportedPlatforms();
    const allRequirements: Record<string, any> = {};
    
    for (const platform of supportedPlatforms) {
      allRequirements[platform] = PlatformFactory.getPlatformConfigRequirements(platform);
    }
    
    return NextResponse.json({
      platforms: supportedPlatforms,
      requirements: allRequirements
    });
  } catch (error) {
    console.error('Error getting platform requirements:', error);
    return NextResponse.json(
      { error: 'Failed to get platform requirements', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}