import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export class CacheService {
  private static TTL = {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    DAILY: 86400, // 24 hours
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  static async set(key: string, value: any, ttl: number = this.TTL.MEDIUM): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error("Cache delete error:", error)
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error("Cache invalidate pattern error:", error)
    }
  }

  // Specific cache methods for common use cases
  static async cacheAccountMetrics(accountId: string, metrics: any): Promise<void> {
    await this.set(`account:${accountId}:metrics`, metrics, this.TTL.MEDIUM)
  }

  static async getCachedAccountMetrics(accountId: string): Promise<any> {
    return this.get(`account:${accountId}:metrics`)
  }

  static async cachePostMetrics(postId: string, metrics: any): Promise<void> {
    await this.set(`post:${postId}:metrics`, metrics, this.TTL.LONG)
  }

  static async getCachedPostMetrics(postId: string): Promise<any> {
    return this.get(`post:${postId}:metrics`)
  }

  static async cacheAIInsights(userId: string, accountId: string, insights: any): Promise<void> {
    await this.set(`ai:${userId}:${accountId}:insights`, insights, this.TTL.DAILY)
  }

  static async getCachedAIInsights(userId: string, accountId: string): Promise<any> {
    return this.get(`ai:${userId}:${accountId}:insights`)
  }

  static async cacheUserAnalytics(userId: string, timeframe: string, analytics: any): Promise<void> {
    await this.set(`analytics:${userId}:${timeframe}`, analytics, this.TTL.MEDIUM)
  }

  static async getCachedUserAnalytics(userId: string, timeframe: string): Promise<any> {
    return this.get(`analytics:${userId}:${timeframe}`)
  }

  static async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`*:${userId}:*`)
  }

  static async invalidateAccountCache(accountId: string): Promise<void> {
    await this.invalidatePattern(`*:${accountId}:*`)
  }
}

export { redis }
