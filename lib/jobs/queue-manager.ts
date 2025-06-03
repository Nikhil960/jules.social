import { DatabaseService } from '../database/database-service'
import { PlatformFactory } from '../integrations/platform-factory'

interface JobData {
  [key: string]: any
}

export class JobQueue {
  /**
   * Schedule a job to be executed after a delay
   * @param jobType Type of job to schedule
   * @param data Job data
   * @param delaySeconds Delay in seconds before executing the job
   * @returns Job ID
   */
  static async scheduleJob(jobType: string, data: JobData, delaySeconds: number): Promise<string | number> {
    // Initialize database
    await DatabaseService.init()
    
    // Create job in database
    const job = await DatabaseService.createJob({
      job_type: jobType,
      data: JSON.stringify(data),
      status: 'scheduled',
      scheduled_for: new Date(Date.now() + delaySeconds * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // If we're in a production environment, we would use a real job queue service
    // For development, we'll use a simple setTimeout
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => {
        this.processJob(job.id)
      }, delaySeconds * 1000)
    }

    return job.id
  }

  /**
   * Process a job
   * @param jobId Job ID
   */
  static async processJob(jobId: string | number): Promise<void> {
    try {
      // Initialize database
      await DatabaseService.init()
      
      // Get job
      const job = await DatabaseService.getJobById(jobId)
      if (!job) {
        console.error(`Job not found: ${jobId}`)
        return
      }

      // Update job status
      await DatabaseService.updateJob(jobId, {
        status: 'processing',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      // Parse job data
      const data = JSON.parse(job.data)

      // Process job based on type
      let result
      switch (job.job_type) {
        case 'publish_post':
          result = await this.processPublishPostJob(data)
          break
        case 'sync_metrics':
          result = await this.processSyncMetricsJob(data)
          break
        default:
          throw new Error(`Unknown job type: ${job.job_type}`)
      }

      // Update job status
      await DatabaseService.updateJob(jobId, {
        status: 'completed',
        result: JSON.stringify(result),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error)

      // Update job status
      await DatabaseService.updateJob(jobId, {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        updated_at: new Date().toISOString(),
      })
    }
  }

  /**
   * Process a publish post job
   * @param data Job data
   */
  private static async processPublishPostJob(data: JobData): Promise<any> {
    const { post_id, platform_id, account_id } = data

    // Get post
    const post = await DatabaseService.getPostById(post_id)
    if (!post) {
      throw new Error(`Post not found: ${post_id}`)
    }

    // Get platform
    const platformData = await DatabaseService.getPostPlatformById(platform_id)
    if (!platformData) {
      throw new Error(`Post platform not found: ${platform_id}`)
    }

    // Get account
    const account = await DatabaseService.getSocialAccountById(account_id)
    if (!account) {
      throw new Error(`Account not found: ${account_id}`)
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

      return result
    } catch (error) {
      // Update post platform status
      await DatabaseService.updatePostPlatform(platform_id, {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        updated_at: new Date().toISOString(),
      })

      throw error
    }
  }

  /**
   * Process a sync metrics job
   * @param data Job data
   */
  private static async processSyncMetricsJob(data: JobData): Promise<any> {
    const { account_id } = data

    // Get account
    const account = await DatabaseService.getSocialAccountById(account_id)
    if (!account) {
      throw new Error(`Account not found: ${account_id}`)
    }

    // Get platform integration
    const integration = PlatformFactory.getIntegration(account.platform)
    if (!integration) {
      throw new Error(`Unsupported platform: ${account.platform}`)
    }

    // Get metrics
    const metrics = await integration.getMetrics({
      accountId: account.platform_account_id,
      accessToken: account.access_token,
    })

    // Save metrics
    await DatabaseService.createAccountMetrics({
      account_id,
      followers: metrics.followers,
      following: metrics.following,
      posts: metrics.posts,
      engagement_rate: metrics.engagementRate,
      collected_at: new Date().toISOString(),
    })

    return metrics
  }

  /**
   * Schedule metrics sync for all accounts
   */
  static async scheduleSyncMetricsForAllAccounts(): Promise<void> {
    // Initialize database
    await DatabaseService.init()
    
    // Get all connected accounts
    const accounts = await DatabaseService.getAllConnectedSocialAccounts()

    // Schedule sync job for each account
    for (const account of accounts) {
      await this.scheduleJob(
        'sync_metrics',
        { account_id: account.id },
        60 // 1 minute delay
      )
    }
  }
}
