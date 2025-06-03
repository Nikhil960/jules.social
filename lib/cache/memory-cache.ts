interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default TTL: 5 minutes
    this.defaultTTL = defaultTTL

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expiresAt })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  // Cache with automatic refresh
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetcher()
    this.set(key, value, ttl)
    return value
  }

  // Memoize function results
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number,
  ): T {
    const generateKey = keyGenerator || ((...args) => JSON.stringify(args))

    return ((...args: Parameters<T>) => {
      const key = `memoized:${fn.name}:${generateKey(...args)}`
      const cached = this.get(key)

      if (cached !== null) {
        return cached
      }

      const result = fn(...args)
      this.set(key, result, ttl)
      return result
    }) as T
  }
}

// Global cache instance
export const cache = new MemoryCache()

// Specialized caches for different use cases
export const userCache = new MemoryCache(10 * 60 * 1000) // 10 minutes for user data
export const analyticsCache = new MemoryCache(30 * 60 * 1000) // 30 minutes for analytics
export const aiCache = new MemoryCache(60 * 60 * 1000) // 1 hour for AI responses
