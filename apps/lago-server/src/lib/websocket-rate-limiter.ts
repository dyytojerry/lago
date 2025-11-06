/**
 * WebSocket Rate Limiter
 * Prevents spam and abuse by limiting message frequency per user and type
 */

export interface RateLimitConfig {
  windowMs: number     // Time window in milliseconds
  maxRequests: number  // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  error?: string
}

// Rate limit configurations for different message types
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // General messaging limits
  'task_notification': { windowMs: 60000, maxRequests: 10 },    // 10 per minute
  'piggybank_update': { windowMs: 60000, maxRequests: 5 },      // 5 per minute
  'real_time_chat': { windowMs: 60000, maxRequests: 30 },       // 30 per minute
  'schedule_reminder': { windowMs: 300000, maxRequests: 5 },    // 5 per 5 minutes
  'reward_notification': { windowMs: 300000, maxRequests: 3 },  // 3 per 5 minutes
  
  // Connection and maintenance
  'ping': { windowMs: 60000, maxRequests: 120 },               // 120 per minute (every 0.5s)
  
  // Default fallback for any other message type
  'default': { windowMs: 60000, maxRequests: 20 }              // 20 per minute
}

// Global rate limit (applies to all message types combined)
const GLOBAL_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60000,    // 1 minute
  maxRequests: 100    // 100 total messages per minute per user
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface UserRateLimits {
  global: RateLimitEntry
  byType: Map<string, RateLimitEntry>
}

class WebSocketRateLimiter {
  private userLimits = new Map<string, UserRateLimits>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if a user is allowed to send a specific message type
   */
  checkLimit(userId: string, messageType: string): RateLimitResult {
    const now = Date.now()
    
    // Get or create user limits
    if (!this.userLimits.has(userId)) {
      this.userLimits.set(userId, {
        global: { count: 0, resetTime: 0 },
        byType: new Map()
      })
    }
    
    const userLimits = this.userLimits.get(userId)!
    
    // Check global rate limit first
    const globalResult = this.checkSingleLimit(
      userLimits.global,
      GLOBAL_RATE_LIMIT,
      now
    )
    
    if (!globalResult.allowed) {
      return {
        allowed: false,
        remaining: globalResult.remaining,
        resetTime: globalResult.resetTime,
        error: 'Global rate limit exceeded'
      }
    }
    
    // Check message type specific limit
    const config = RATE_LIMITS[messageType] || RATE_LIMITS['default']
    
    if (!userLimits.byType.has(messageType)) {
      userLimits.byType.set(messageType, { count: 0, resetTime: 0 })
    }
    
    const typeLimit = userLimits.byType.get(messageType)!
    const typeResult = this.checkSingleLimit(typeLimit, config, now)
    
    if (!typeResult.allowed) {
      return {
        allowed: false,
        remaining: typeResult.remaining,
        resetTime: typeResult.resetTime,
        error: `Rate limit exceeded for message type: ${messageType}`
      }
    }
    
    // Both limits passed, increment counters
    userLimits.global.count++
    typeLimit.count++
    
    return {
      allowed: true,
      remaining: Math.min(globalResult.remaining - 1, typeResult.remaining - 1),
      resetTime: Math.max(globalResult.resetTime, typeResult.resetTime)
    }
  }
  
  /**
   * Check a single rate limit entry
   */
  private checkSingleLimit(
    entry: RateLimitEntry,
    config: RateLimitConfig,
    now: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    // Reset window if expired
    if (now >= entry.resetTime) {
      entry.count = 0
      entry.resetTime = now + config.windowMs
    }
    
    const remaining = Math.max(0, config.maxRequests - entry.count)
    const allowed = entry.count < config.maxRequests
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    }
  }
  
  /**
   * Get current rate limit status for a user
   */
  getStatus(userId: string, messageType?: string): RateLimitResult {
    const userLimits = this.userLimits.get(userId)
    if (!userLimits) {
      const config = messageType ? (RATE_LIMITS[messageType] || RATE_LIMITS['default']) : GLOBAL_RATE_LIMIT
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs
      }
    }
    
    const now = Date.now()
    
    if (messageType) {
      const config = RATE_LIMITS[messageType] || RATE_LIMITS['default']
      const typeLimit = userLimits.byType.get(messageType) || { count: 0, resetTime: now + config.windowMs }
      return this.checkSingleLimit(typeLimit, config, now)
    } else {
      return this.checkSingleLimit(userLimits.global, GLOBAL_RATE_LIMIT, now)
    }
  }
  
  /**
   * Reset rate limits for a specific user (admin function)
   */
  resetUser(userId: string): void {
    this.userLimits.delete(userId)
  }
  
  /**
   * Clean up expired rate limit entries to prevent memory leaks
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now()
    
    for (const [userId, userLimits] of Array.from(this.userLimits.entries())) {
      // Clean up expired type-specific limits
      for (const [messageType, entry] of Array.from(userLimits.byType.entries())) {
        if (now >= entry.resetTime && entry.count === 0) {
          userLimits.byType.delete(messageType)
        }
      }
      
      // Remove user entry if no active limits
      if (now >= userLimits.global.resetTime && 
          userLimits.global.count === 0 && 
          userLimits.byType.size === 0) {
        this.userLimits.delete(userId)
      }
    }
  }
  
  /**
   * Get statistics about current rate limiting
   */
  getStats(): {
    totalUsers: number
    totalActiveWindows: number
    rateLimitConfigs: typeof RATE_LIMITS
  } {
    let totalActiveWindows = 0
    
    for (const userLimits of Array.from(this.userLimits.values())) {
      if (userLimits.global.count > 0) totalActiveWindows++
      totalActiveWindows += userLimits.byType.size
    }
    
    return {
      totalUsers: this.userLimits.size,
      totalActiveWindows,
      rateLimitConfigs: RATE_LIMITS
    }
  }
  
  /**
   * Cleanup when shutting down
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.userLimits.clear()
  }
}

// Singleton instance
export const rateLimiter = new WebSocketRateLimiter()

// Helper function for easy rate limit checking
export function checkRateLimit(userId: string, messageType: string): RateLimitResult {
  return rateLimiter.checkLimit(userId, messageType)
}

// Helper function to get rate limit status
export function getRateLimitStatus(userId: string, messageType?: string): RateLimitResult {
  return rateLimiter.getStatus(userId, messageType)
}