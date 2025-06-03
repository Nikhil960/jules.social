import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database/database-service'
import { PlatformFactory } from '@/lib/integrations/platform-factory'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { post_id, platform_id, account_id } = body

    // Validate required fields
    if (!post_id || !platform_id || !account_id) {
      return NextResponse.json(
        { error: 'Post ID, platform ID, and account ID are required' },
        { status: 400 }
      )
    }

    // Get post
    const post = await DatabaseService.getPostById(post_id)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get platform
    const platformData = await DatabaseService.getPostPlatformById(platform_id)
    if (!platformData) {
      return NextResponse.json(
        { error: 'Post platform not found' },
        { status: 404 }
      )
    }

    // Get account
    const account = await DatabaseService.getSocialAccountById(account_id)
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Update post platform status
    await DatabaseService.updatePostPlatform(platform_id, {
      status: 'publishing',
      updated_at: new Date().toISOString(),
    })

    try {
      // Get platform integration
      const integration = PlatformFactory.getIntegration(account.platform)
      if (!integration) {
        throw new Error(`Unsupported platform: ${account.platform}`)
      }

      // Publish post
      const result = await integration.publishPost({
        accountId: account.platform_account_id,
        accessToken: account.access_token,
        content: post.content,
        mediaUrls: post.media_urls,
        hashtags: post.hashtags,
      })

      // Update post platform status
      await DatabaseService.updatePostPlatform(platform_id, {
        status: 'published',
        platform_post_id: result.id,
        platform_post_url: result.url,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        post_id: post.id,
        platform: account.platform,
        platform_post_id: result.id,
        platform_post_url: result.url,
      })
    } catch (error: any) {
      // Update post platform status
      await DatabaseService.updatePostPlatform(platform_id, {
        status: 'failed',
        error: error.message || 'Unknown error',
        updated_at: new Date().toISOString(),
      })

      return NextResponse.json(
        { error: error.message || 'Failed to publish post' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Post publishing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    )
  }
}
