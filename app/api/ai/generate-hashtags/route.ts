/**
 * API Route: /api/ai/generate-hashtags
 * 
 * Generates relevant hashtags for social media content using AI.
 * This endpoint uses the GeminiAIService to create platform-specific hashtags.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { GeminiAIService, HashtagGenerationOptions } from '@/lib/ai/gemini-ai-service';
import { PlatformFactory } from '@/lib/platforms/platform-factory';

export async function POST(request: NextRequest) {
  try {
    // Initialize services
    const authService = new AuthService();
    const aiService = new GeminiAIService();
    
    // Parse request body
    const body = await request.json();
    const { 
      content, 
      platform, 
      count = 5,
      relevance = 'high',
      include_popular = true
    } = body;
    
    // Validate required fields
    if (!content || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: content and platform' },
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
    
    // Set up hashtag generation options
    const hashtagOptions: HashtagGenerationOptions = {
      platform,
      count: Math.min(Math.max(1, count), 30), // Limit between 1 and 30
      relevance: relevance as 'high' | 'medium' | 'trending',
      includePopular: include_popular
    };
    
    // Generate hashtags
    const hashtags = await aiService.generateHashtags(content, hashtagOptions);
    
    // Return generated hashtags
    return NextResponse.json({
      content,
      platform,
      hashtags,
      count: hashtags.length
    });
  } catch (error) {
    console.error('Error generating hashtags:', error);
    return NextResponse.json(
      { error: 'Failed to generate hashtags', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}