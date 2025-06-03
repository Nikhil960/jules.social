/**
 * API Route: /api/ai/optimize-content
 * 
 * Optimizes social media content using AI for a specific platform.
 * This endpoint uses the GeminiAIService to enhance content and generate hashtags.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { GeminiAIService, ContentOptimizationOptions } from '@/lib/ai/gemini-ai-service';
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
      target_audience, 
      tone, 
      max_length, 
      include_emojis, 
      include_hashtags,
      content_goal,
      hashtag_count
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
    
    // Set up optimization options
    const optimizationOptions: ContentOptimizationOptions = {
      platform,
      targetAudience: target_audience,
      tone,
      maxLength: max_length,
      includeEmojis: include_emojis,
      includeHashtags: include_hashtags === true ? true : false,
      contentGoal: content_goal as 'engagement' | 'clicks' | 'awareness' | 'conversion'
    };
    
    // Optimize content
    const optimizedContent = await aiService.optimizeContent(content, optimizationOptions);
    
    // Generate hashtags if requested
    let hashtags: string[] = [];
    if (include_hashtags) {
      hashtags = await aiService.generateHashtags(content, {
        platform,
        count: hashtag_count || 5,
        relevance: 'high',
        includePopular: true
      });
    }
    
    // Analyze content
    const contentAnalysis = await aiService.analyzeContent(optimizedContent, platform);
    
    // Return optimized content
    return NextResponse.json({
      original_content: content,
      optimized_content: optimizedContent,
      hashtags,
      analysis: contentAnalysis
    });
  } catch (error) {
    console.error('Error optimizing content:', error);
    return NextResponse.json(
      { error: 'Failed to optimize content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}