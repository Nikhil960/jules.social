interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests

    // Clean up expired entries every 5 minutes
    setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    if (entry.count >= this.maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.windowMs
    }
    return entry.resetTime
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

// Create different rate limiters for different endpoints
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes for auth
export const apiRateLimiter = new RateLimiter(15 * 60 * 1000, 100) // 100 requests per 15 minutes for API
export const aiRateLimiter = new RateLimiter(60 * 60 * 1000, 50) // 50 AI requests per hour

export function getRateLimitHeaders(identifier: string, limiter: RateLimiter) {
  return {
    "X-RateLimit-Limit": limiter["maxRequests"].toString(),
    "X-RateLimit-Remaining": limiter.getRemainingRequests(identifier).toString(),
    "X-RateLimit-Reset": Math.ceil(limiter.getResetTime(identifier) / 1000).toString(),
  }
}

export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for different deployment environments)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown"
  return ip.trim()
}
