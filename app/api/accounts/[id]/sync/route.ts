import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DatabaseService } from "@/lib/database/supabase"
import { jobQueue } from "@/lib/jobs/queue-manager"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accountId = params.id
    const account = await DatabaseService.getSocialAccountById(accountId)

    if (!account || account.user_id !== user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Schedule sync job instead of doing it synchronously
    await jobQueue.scheduleDataSync(accountId, account.platform)

    return NextResponse.json({
      success: true,
      message: "Sync job scheduled successfully",
    })
  } catch (error) {
    console.error("Error scheduling sync:", error)
    return NextResponse.json({ error: "Failed to schedule sync" }, { status: 500 })
  }
}
