/**
 * API Route: /api/ai/analyze-content
 * 
 * Analyzes social media content using AI to provide feedback and suggestions.
 * This endpoint uses the GeminiAIService to evaluate content quality and engagement potential.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { GeminiAIService } from '@/lib/ai/gemini-ai-service';
import { PlatformFactory } from '@/lib/platforms/platform-factory';

export async function POST(request: NextRequest) {
  try {
    // Initialize services
    const authService = new AuthService();
    const aiService = new GeminiAIService();
    
    // Parse request body
    const body = await request.json();
    const { content, platform } = body;
    
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
    const authService = new AuthService();
    const user = await authService.verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Analyze content
    const analysis = await aiService.analyzeContent(content, platform);
    
    // Return analysis results
    return NextResponse.json({
      content,
      platform,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}