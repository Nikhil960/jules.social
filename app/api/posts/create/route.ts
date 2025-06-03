import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { DatabaseService } from '@/lib/database/database-service'
import { GeminiAIService } from '@/lib/ai/gemini-service'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] // Bearer token

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and get user
    const user = await AuthService.getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      content, 
      platforms, 
      media_urls, 
      schedule_time, 
      optimize_with_ai,
      hashtags
    } = body

    // Validate required fields
    if (!content || !platforms || !platforms.length) {
      return NextResponse.json(
        { error: 'Content and at least one platform are required' },
        { status: 400 }
      )
    }

    // Validate platforms
    for (const platformData of platforms) {
      const { platform, account_id } = platformData
      
      if (!platform || !account_id) {
        return NextResponse.json(
          { error: 'Each platform must include platform name and account_id' },
          { status: 400 }
        )
      }

      // Verify account belongs to user
      const account = await DatabaseService.getSocialAccountById(account_id)
      if (!account || account.user_id !== user.id) {
        return NextResponse.json(
          { error: `Account not found or not owned by user: ${account_id}` },
          { status: 403 }
        )
      }
    }

    // Process content with AI if requested
    let finalContent = content
    let finalHashtags = hashtags || []

    if (optimize_with_ai) {
      try {
        const geminiAI = new GeminiAIService()
        const targetPlatforms = platforms.map(p => p.platform)
        
        const optimizationResult = await geminiAI.optimizePost(content, targetPlatforms)
        
        if (optimizationResult.optimizedContent) {
          finalContent = optimizationResult.optimizedContent
        }
        
        if (optimizationResult.suggestedHashtags && optimizationResult.suggestedHashtags.length > 0) {
          finalHashtags = [...new Set([...finalHashtags, ...optimizationResult.suggestedHashtags])]
        }
      } catch (aiError) {
        console.error('AI optimization error:', aiError)
        // Continue with original content if AI fails
      }
    }

    // Create post in database
    const post = await DatabaseService.createPost({
      user_id: user.id,
      content: finalContent,
      media_urls: media_urls || [],
      hashtags: finalHashtags,
      schedule_time: schedule_time ? new Date(schedule_time).toISOString() : null,
      status: schedule_time ? 'scheduled' : 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create platform-specific post entries
    for (const platformData of platforms) {
      await DatabaseService.createPostPlatform({
        post_id: post.id,
        platform: platformData.platform,
        account_id: platformData.account_id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Return created post
    return NextResponse.json({
      id: post.id,
      content: post.content,
      media_urls: post.media_urls,
      hashtags: post.hashtags,
      schedule_time: post.schedule_time,
      status: post.status,
      platforms: platforms.map(p => p.platform),
      created_at: post.created_at,
    })
  } catch (error: any) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}
