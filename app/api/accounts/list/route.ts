import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { DatabaseService } from '@/lib/database/database-service'

export async function GET(request: NextRequest) {
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

    // Get user's social accounts
    const accounts = await DatabaseService.getSocialAccountsByUserId(user.id)

    // Get metrics for each account
    const accountsWithMetrics = await Promise.all(accounts.map(async (account) => {
      const metrics = await DatabaseService.getLatestAccountMetrics(account.id)
      return {
        id: account.id,
        platform: account.platform,
        username: account.username,
        profile_url: account.profile_url,
        avatar_url: account.avatar_url,
        is_connected: account.is_connected,
        created_at: account.created_at,
        updated_at: account.updated_at,
        metrics: metrics || {
          followers: 0,
          following: 0,
          posts: 0,
          engagement_rate: 0,
        }
      }
    }))

    return NextResponse.json(accountsWithMetrics)
  } catch (error: any) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}
