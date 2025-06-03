/**
 * API Route: /api/accounts/connect
 * 
 * Handles connecting social media accounts through OAuth flow.
 * This endpoint receives the authorization code from the OAuth callback
 * and exchanges it for access tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { DatabaseService } from '@/lib/database/database-service';
import { PlatformFactory } from '@/lib/platforms/platform-factory';

export async function POST(request: NextRequest) {
  try {
    // Initialize services
    const authService = new AuthService();
    const dbService = new DatabaseService();
    
    // Parse request body
    const body = await request.json();
    const { platform, code } = body;
    
    // Validate required fields
    if (!platform || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: platform and code' },
        { status: 400 }
      );
    }
    
    // Validate platform
    if (!PlatformFactory.isPlatformSupported(platform)) {
      return NextResponse.json(
        { error: `Unsupported platform: ${platform}` },
        { status: 400 }
      );
    }
    
    // Get user from auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const user = await authService.verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Get platform integration
    const platformIntegration = PlatformFactory.createPlatformIntegration(platform);
    
    // Exchange code for tokens
    const authResult = await platformIntegration.handleAuthCallback(code);
    
    if (!authResult || !authResult.access_token) {
      return NextResponse.json(
        { error: 'Failed to authenticate with platform' },
        { status: 400 }
      );
    }
    
    // Save account to database
    const accountData = {
      user_id: user.id,
      platform: platform.toLowerCase(),
      platform_account_id: authResult.user_id || authResult.account_data?.page_id || `${platform}_${Date.now()}`,
      access_token: authResult.access_token,
      refresh_token: authResult.refresh_token || null,
      token_expires_at: authResult.expires_in ? new Date(Date.now() + authResult.expires_in * 1000).toISOString() : null,
      account_name: authResult.account_data?.name || `${platform} Account`,
      account_username: authResult.account_data?.username || authResult.account_data?.name || null,
      profile_image_url: authResult.account_data?.picture || null,
      is_connected: true,
      metadata: JSON.stringify({
        followers_count: authResult.account_data?.followers_count || 0,
        following_count: authResult.account_data?.following_count || 0,
        posts_count: authResult.account_data?.posts_count || 0,
        connected_at: new Date().toISOString()
      })
    };
    
    // Check if account already exists
    const existingAccount = await dbService.getSocialAccountByPlatformId(
      user.id,
      platform.toLowerCase(),
      accountData.platform_account_id
    );
    
    let account;
    if (existingAccount) {
      // Update existing account
      account = await dbService.updateSocialAccount(
        existingAccount.id,
        {
          access_token: accountData.access_token,
          refresh_token: accountData.refresh_token,
          token_expires_at: accountData.token_expires_at,
          is_connected: true,
          metadata: accountData.metadata
        }
      );
    } else {
      // Create new account
      account = await dbService.createSocialAccount(accountData);
    }
    
    // Get initial metrics
    try {
      const metrics = await platformIntegration.getAccountMetrics(accountData.platform_account_id);
      
      if (metrics) {
        await dbService.createAccountMetrics({
          account_id: account.id,
          followers_count: metrics.followers || 0,
          following_count: metrics.following || 0,
          posts_count: metrics.posts || 0,
          engagement_rate: metrics.engagement_rate || 0,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to get initial metrics:', error);
      // Continue without metrics - we'll get them later
    }
    
    // Return connected account details (without sensitive data)
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        account_name: account.account_name,
        account_username: account.account_username,
        profile_image_url: account.profile_image_url,
        is_connected: account.is_connected,
        connected_at: JSON.parse(account.metadata || '{}').connected_at
      }
    });
  } catch (error) {
    console.error('Error connecting account:', error);
    return NextResponse.json(
      { error: 'Failed to connect account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
