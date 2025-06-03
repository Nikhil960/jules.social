/**
 * API Route: /api/accounts/disconnect
 * 
 * Handles disconnecting social media accounts.
 * This endpoint removes the connection between a user and a social media platform.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { DatabaseService } from '@/lib/database/database-service';

export async function POST(request: NextRequest) {
  try {
    // Initialize services
    const authService = new AuthService();
    const dbService = new DatabaseService();
    
    // Parse request body
    const body = await request.json();
    const { account_id } = body;
    
    // Validate required fields
    if (!account_id) {
      return NextResponse.json(
        { error: 'Missing required field: account_id' },
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
    
    // Get the account
    const account = await dbService.getSocialAccountById(account_id);
    
    // Verify account exists and belongs to user
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    if (account.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to disconnect this account' },
        { status: 403 }
      );
    }
    
    // Update account to disconnect it
    // Note: We don't delete the account, just mark it as disconnected
    const updatedAccount = await dbService.updateSocialAccount(account_id, {
      is_connected: false,
      access_token: null,  // Clear tokens for security
      refresh_token: null,
      token_expires_at: null,
      metadata: JSON.stringify({
        ...JSON.parse(account.metadata || '{}'),
        disconnected_at: new Date().toISOString()
      })
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully',
      account_id: updatedAccount.id
    });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}