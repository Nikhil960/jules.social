import cron from "node-cron"
import { DatabaseService } from "../config/database"
import { SocialMediaService } from "../integrations/social-media"

export class SchedulerService {
  private static instance: SchedulerService
  private jobs: Map<string, cron.ScheduledTask> = new Map()

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService()
    }
    return SchedulerService.instance
  }

  startScheduler() {
    console.log("Starting PostCraft Scheduler...")

    // Check for scheduled posts every minute
    const publishJob = cron.schedule(
      "* * * * *",
      async () => {
        await this.processScheduledPosts()
      },
      {
        scheduled: false,
      },
    )

    // Sync social media data every hour
    const syncJob = cron.schedule(
      "0 * * * *",
      async () => {
        await this.syncSocialMediaData()
      },
      {
        scheduled: false,
      },
    )

    // Generate daily analytics at 9 AM
    const analyticsJob = cron.schedule(
      "0 9 * * *",
      async () => {
        await this.generateDailyAnalytics()
      },
      {
        scheduled: false,
      },
    )

    this.jobs.set("publish", publishJob)
    this.jobs.set("sync", syncJob)
    this.jobs.set("analytics", analyticsJob)

    // Start all jobs
    this.jobs.forEach((job) => job.start())

    console.log("Scheduler started successfully")
  }

  stopScheduler() {
    this.jobs.forEach((job) => job.stop())
    this.jobs.clear()
    console.log("Scheduler stopped")
  }

  private async processScheduledPosts() {
    try {
      const scheduledPosts = DatabaseService.getScheduledPosts()

      for (const post of scheduledPosts) {
        try {
          console.log(`Publishing post ${post.id}...`)

          // Update status to publishing
          DatabaseService.updatePostStatus(post.id, "publishing")

          // Publish to each platform
          const results = await SocialMediaService.publishPost(post)

          // Update status based on results
          const allSuccessful = results.every((r) => r.success)
          if (allSuccessful) {
            DatabaseService.updatePostStatus(post.id, "published", new Date().toISOString())
            console.log(`Post ${post.id} published successfully`)
          } else {
            const errors = results
              .filter((r) => !r.success)
              .map((r) => r.error)
              .join(", ")
            DatabaseService.updatePostStatus(post.id, "failed", undefined, errors)
            console.error(`Post ${post.id} failed to publish:`, errors)
          }
        } catch (error) {
          console.error(`Error publishing post ${post.id}:`, error)
          DatabaseService.updatePostStatus(
            post.id,
            "failed",
            undefined,
            error instanceof Error ? error.message : "Unknown error",
          )
        }
      }
    } catch (error) {
      console.error("Error processing scheduled posts:", error)
    }
  }

  private async syncSocialMediaData() {
    try {
      console.log("Starting social media data sync...")

      // This would sync data from connected social media accounts
      // For now, we'll generate mock analytics data
      await this.generateMockAnalytics()

      console.log("Social media data sync completed")
    } catch (error) {
      console.error("Error syncing social media data:", error)
    }
  }

  private async generateDailyAnalytics() {
    try {
      console.log("Generating daily analytics...")

      // This would generate and cache daily analytics reports
      // Implementation would depend on your analytics requirements

      console.log("Daily analytics generated")
    } catch (error) {
      console.error("Error generating daily analytics:", error)
    }
  }

  private async generateMockAnalytics() {
    // Generate mock analytics data for demo purposes
    const accounts = DatabaseService.getUserSocialAccounts(1) // Mock user ID
    const today = new Date().toISOString().split("T")[0]

    for (const account of accounts) {
      const mockMetrics = {
        account_id: account.id,
        date: today,
        followers_count: Math.floor(Math.random() * 1000) + 500,
        following_count: Math.floor(Math.random() * 500) + 100,
        posts_count: Math.floor(Math.random() * 50) + 10,
        engagement_rate: Math.random() * 10 + 2,
        reach: Math.floor(Math.random() * 5000) + 1000,
        impressions: Math.floor(Math.random() * 10000) + 2000,
        profile_views: Math.floor(Math.random() * 500) + 100,
        website_clicks: Math.floor(Math.random() * 100) + 10,
      }

      try {
        DatabaseService.createAccountMetrics(mockMetrics)
      } catch (error) {
        // Ignore duplicate key errors for demo
      }
    }
  }

  scheduleCustomJob(name: string, cronExpression: string, callback: () => Promise<void>) {
    if (this.jobs.has(name)) {
      this.jobs.get(name)?.stop()
    }

    const job = cron.schedule(cronExpression, callback, { scheduled: false })
    this.jobs.set(name, job)
    job.start()

    console.log(`Custom job '${name}' scheduled with expression: ${cronExpression}`)
  }

  stopJob(name: string) {
    const job = this.jobs.get(name)
    if (job) {
      job.stop()
      this.jobs.delete(name)
      console.log(`Job '${name}' stopped`)
    }
  }
}

export const scheduler = SchedulerService.getInstance()
