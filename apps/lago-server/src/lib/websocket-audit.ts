/**
 * WebSocket Security Audit Logger
 * Tracks all security events for monitoring, compliance, and incident response
 */

export interface AuditEvent {
  id: string
  timestamp: Date
  eventType: 'connection' | 'authentication' | 'authorization' | 'message' | 'rate_limit' | 'error'
  action: string
  userId?: string
  userRole?: 'parent' | 'child' | 'unknown'
  targetUserId?: string
  messageType?: string
  success: boolean
  error?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

export interface AuditLogger {
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void
  getEvents(filters?: AuditEventFilters): Promise<AuditEvent[]>
  getSecurityAlerts(): Promise<AuditEvent[]>
}

export interface AuditEventFilters {
  userId?: string
  eventType?: string
  success?: boolean
  startTime?: Date
  endTime?: Date
  limit?: number
}

class InMemoryAuditLogger implements AuditLogger {
  private events: AuditEvent[] = []
  private maxEvents = 10000 // Keep last 10k events in memory
  
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      ...event
    }
    
    this.events.unshift(auditEvent)
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }
    
    // Log to console for immediate visibility
    this.logToConsole(auditEvent)
    
    // Check for security alerts
    this.checkSecurityAlerts(auditEvent)
  }
  
  async getEvents(filters?: AuditEventFilters): Promise<AuditEvent[]> {
    let filteredEvents = [...this.events]
    
    if (filters) {
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filters.userId)
      }
      if (filters.eventType) {
        filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType)
      }
      if (filters.success !== undefined) {
        filteredEvents = filteredEvents.filter(e => e.success === filters.success)
      }
      if (filters.startTime) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startTime!)
      }
      if (filters.endTime) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endTime!)
      }
      if (filters.limit) {
        filteredEvents = filteredEvents.slice(0, filters.limit)
      }
    }
    
    return filteredEvents
  }
  
  async getSecurityAlerts(): Promise<AuditEvent[]> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    return this.events.filter(event => 
      event.timestamp >= oneHourAgo &&
      (!event.success || event.eventType === 'rate_limit') &&
      ['authentication', 'authorization', 'rate_limit'].includes(event.eventType)
    )
  }
  
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private logToConsole(event: AuditEvent): void {
    const level = event.success ? 'info' : 'warn'
    const emoji = this.getEventEmoji(event)
    
    console[level](`${emoji} [AUDIT] ${event.eventType.toUpperCase()}: ${event.action}`, {
      userId: event.userId,
      userRole: event.userRole,
      targetUserId: event.targetUserId,
      success: event.success,
      error: event.error,
      timestamp: event.timestamp.toISOString()
    })
  }
  
  private getEventEmoji(event: AuditEvent): string {
    if (!event.success) return '🚨'
    
    switch (event.eventType) {
      case 'connection': return '🔗'
      case 'authentication': return '🔐'
      case 'authorization': return '🛡️'
      case 'message': return '📨'
      case 'rate_limit': return '⏰'
      case 'error': return '❌'
      default: return '📝'
    }
  }
  
  private checkSecurityAlerts(event: AuditEvent): void {
    // Alert on repeated failures
    if (!event.success && event.userId) {
      const recentFailures = this.events
        .filter(e => 
          e.userId === event.userId && 
          !e.success && 
          e.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
        )
        .length
      
      if (recentFailures >= 5) {
        console.error('🚨 SECURITY ALERT: Multiple failures detected', {
          userId: event.userId,
          failureCount: recentFailures,
          eventType: event.eventType
        })
      }
    }
    
    // Alert on rate limiting
    if (event.eventType === 'rate_limit') {
      console.warn('⚠️ RATE LIMIT: User exceeded message limits', {
        userId: event.userId,
        messageType: event.messageType,
        error: event.error
      })
    }
  }
}

// Singleton audit logger instance
export const auditLogger = new InMemoryAuditLogger()

// Convenience functions for common audit events
export function auditConnection(userId: string, userRole: 'parent' | 'child' | 'unknown', success: boolean, error?: string) {
  auditLogger.log({
    eventType: 'connection',
    action: 'websocket_connect',
    userId,
    userRole,
    success,
    error
  })
}

export function auditAuthentication(userId: string | undefined, success: boolean, error?: string, metadata?: Record<string, any>) {
  auditLogger.log({
    eventType: 'authentication',
    action: 'token_verification',
    userId,
    success,
    error,
    metadata
  })
}

export function auditAuthorization(
  userId: string,
  userRole: 'parent' | 'child' | 'unknown',
  action: string,
  success: boolean = true,
  targetUserId?: string,
  error?: string,
  metadata?: Record<string, any>
) {
  auditLogger.log({
    eventType: 'authorization',
    action,
    userId,
    userRole,
    targetUserId,
    success,
    error,
    metadata
  })
}

export function auditMessage(
  userId: string,
  userRole: 'parent' | 'child' | 'unknown',
  messageType: string,
  targetUserId?: string,
  success: boolean = true,
  error?: string,
  metadata?: Record<string, any>
) {
  auditLogger.log({
    eventType: 'message',
    action: 'send_message',
    userId,
    userRole,
    targetUserId,
    messageType,
    success,
    error,
    metadata
  })
}

export function auditRateLimit(
  userId: string,
  messageType: string,
  error: string,
  metadata?: Record<string, any>
) {
  auditLogger.log({
    eventType: 'rate_limit',
    action: 'limit_exceeded',
    userId,
    messageType,
    success: false,
    error,
    metadata
  })
}

export function auditError(
  userId: string | undefined,
  action: string,
  error?: string,
  metadata?: Record<string, any>
) {
  auditLogger.log({
    eventType: 'error',
    action,
    userId,
    success: false,
    error,
    metadata
  })
}

// Security monitoring functions
export async function getFailedAttempts(userId: string, timeWindowMinutes: number = 60): Promise<AuditEvent[]> {
  const startTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000)
  return auditLogger.getEvents({
    userId,
    success: false,
    startTime,
    eventType: 'authorization'
  })
}

export async function getSecurityAlerts(): Promise<AuditEvent[]> {
  return auditLogger.getSecurityAlerts()
}

export async function getUserActivity(userId: string, limit: number = 100): Promise<AuditEvent[]> {
  return auditLogger.getEvents({
    userId,
    limit
  })
}

// Export the audit logger for advanced usage
export { auditLogger as wsAuditLogger }