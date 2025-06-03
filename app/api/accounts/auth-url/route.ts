/**
 * API Route: /api/accounts/auth-url
 * 
 * Generates the OAuth authorization URL for connecting a social media account.
 * This endpoint is called when a user wants to connect a new social account.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { PlatformFactory } from '@/lib/platforms/platform-factory';

export async function GET(request: NextRequest) {
  try {
    // Get platform from query parameters
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    
    // Validate platform parameter
    if (!platform) {
      return NextResponse.json(
        { error: 'Missing required parameter: platform' },
        { status: 400 }
      );
    }
    
    // Validate platform is supported
    if (!PlatformFactory.isPlatformSupported(platform)) {
      return NextResponse.json(
        { error: `Unsupported platform: ${platform}` },
        { status: 400 }
      );
    }
    
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const authService = new AuthService();
    const user = await authService.verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Get platform integration
    const platformIntegration = PlatformFactory.createPlatformIntegration(platform);
    
    // Generate authorization URL
    const authUrl = platformIntegration.getAuthUrl();
    
    // Return the authorization URL
    return NextResponse.json({
      platform,
      auth_url: authUrl
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}