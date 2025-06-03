import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { DatabaseService } from '@/lib/database/database-service'
import { JobQueue } from '@/lib/jobs/queue-manager'

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
    const { post_id, schedule_time } = body

    // Validate required fields
    if (!post_id || !schedule_time) {
      return NextResponse.json(
        { error: 'Post ID and schedule time are required' },
        { status: 400 }
      )
    }

    // Validate schedule time is in the future
    const scheduleDate = new Date(schedule_time)
    const now = new Date()
    if (scheduleDate <= now) {
      return NextResponse.json(
        { error: 'Schedule time must be in the future' },
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

    // Verify post belongs to user
    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to schedule this post' },
        { status: 403 }
      )
    }

    // Get post platforms
    const postPlatforms = await DatabaseService.getPostPlatforms(post_id)
    if (!postPlatforms || postPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'Post has no platforms configured' },
        { status: 400 }
      )
    }

    // Update post schedule time and status
    await DatabaseService.updatePost(post_id, {
      schedule_time: scheduleDate.toISOString(),
      status: 'scheduled',
      updated_at: new Date().toISOString(),
    })

    // Calculate delay in seconds
    const delaySeconds = Math.floor((scheduleDate.getTime() - now.getTime()) / 1000)

    // Schedule job for each platform
    const scheduledJobs = []
    for (const platform of postPlatforms) {
      const jobId = await JobQueue.scheduleJob(
        'publish_post',
        {
          post_id: post.id,
          platform_id: platform.id,
          account_id: platform.account_id,
        },
        delaySeconds
      )

      scheduledJobs.push({
        platform: platform.platform,
        job_id: jobId,
      })
    }

    return NextResponse.json({
      id: post.id,
      schedule_time: scheduleDate.toISOString(),
      status: 'scheduled',
      scheduled_jobs: scheduledJobs,
    })
  } catch (error: any) {
    console.error('Post scheduling error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
