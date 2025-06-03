import { NextRequest, NextResponse } from 'next/server'
import { verifyEdgeToken } from './lib/auth/edgeAuth'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/analytics',
  '/calendar',
  '/messages',
  '/studio',
  '/api/accounts',
  '/api/posts',
  '/api/analytics',
  '/api/settings',
  '/api/ai',
  '/api/media',
  '/api/jobs',
  '/api/templates',
]

// Define public API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
]

// Rate limiting configuration
const RATE_LIMIT_DURATION = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60

// Simple in-memory rate limiting store
type RateLimitStore = {
  [ip: string]: {
    count: number
    resetAt: number
  }
}

const rateLimitStore: RateLimitStore = {}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const response = applyRateLimit(request)
    if (response) return response
  }

  // Skip authentication for public routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split(' ')[1] // Bearer token

  // For non-API routes, check for cookie
  const tokenCookie = request.cookies.get('auth_token')?.value
  const finalToken = token || tokenCookie

  if (!finalToken) {
    // Redirect to login for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Return 401 for API routes
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify token and get user
    const decodedToken = verifyEdgeToken(finalToken) as any
    // If token is valid, we can proceed. We don't need to fetch the user from DB in middleware.
    // The actual user data will be fetched on the server-side pages/APIs.
    


    // Continue to the protected route
    return NextResponse.next()
  } catch (error) {
    console.error('Authentication error:', error)
    
    // Redirect to login for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Return 401 for API routes
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// Apply rate limiting
function applyRateLimit(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  
  // Initialize or reset rate limit data if expired
  if (!rateLimitStore[ip] || rateLimitStore[ip].resetAt < now) {
    rateLimitStore[ip] = {
      count: 0,
      resetAt: now + RATE_LIMIT_DURATION,
    }
  }
  
  // Increment request count
  rateLimitStore[ip].count++
  
  // Check if rate limit exceeded
  if (rateLimitStore[ip].count > MAX_REQUESTS_PER_MINUTE) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    )
  }
  
  return null
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
