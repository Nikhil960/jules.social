import { type NextRequest, NextResponse } from "next/server"
import { verifySignature } from "@upstash/qstash/nextjs"
import { DatabaseService } from "@/lib/database/supabase"
import { instagramIntegration } from "@/lib/integrations/instagram"

async function handler(request: NextRequest) {
  try {
    const { accountId, platform, jobType } = await request.json()

    if (jobType !== "data_sync") {
      return NextResponse.json({ error: "Invalid job type" }, { status: 400 })
    }

    console.log(`Starting data sync for account ${accountId} on ${platform}`)

    // Update job status to processing
    await DatabaseService.createJobRecord({
      job_type: "data_sync",
      job_data: { accountId, platform },
      status: "processing",
    })

    let syncResult

    switch (platform) {
      case "instagram":
        // Sync account data
        await instagramIntegration.syncAccountData(accountId)

        // Sync posts
        const postsSynced = await instagramIntegration.syncPosts(accountId)

        syncResult = {
          account_synced: true,
          posts_synced: postsSynced,
        }
        break

      case "facebook":
        // Facebook sync would go here
        throw new Error("Facebook sync not implemented yet")

      case "x":
        // X sync would go here
        throw new Error("X sync not implemented yet")

      case "linkedin":
        // LinkedIn sync would go here
        throw new Error("LinkedIn sync not implemented yet")

      case "tiktok":
        // TikTok sync would go here
        throw new Error("TikTok sync not implemented yet")

      case "youtube":
        // YouTube sync would go here
        throw new Error("YouTube sync not implemented yet")

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }

    // Update job status to completed
    await DatabaseService.updateJobStatus(accountId, "completed", syncResult)

    console.log(`Data sync completed for account ${accountId}:`, syncResult)

    return NextResponse.json({
      success: true,
      result: syncResult,
    })
  } catch (error) {
    console.error("Error in data sync job:", error)

    // Update job status to failed
    try {
      const { accountId } = await request.json()
      await DatabaseService.updateJobStatus(
        accountId,
        "failed",
        null,
        error instanceof Error ? error.message : "Unknown error",
      )
    } catch (dbError) {
      console.error("Error updating job status:", dbError)
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 })
  }
}

export const POST = verifySignature(handler)
