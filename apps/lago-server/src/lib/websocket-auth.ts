import { prisma } from './prisma'
// import { User } from '@prisma/client'

export interface AuthorizedRelationship {
  isValid: boolean
  targetUser?: { id: string; role: 'parent' | 'child'; familyId: string | null }
  relationship?: 'parent_to_child' | 'child_to_parent'
  error?: string
}

export interface ResourceAuthResult {
  isAuthorized: boolean
  resource?: any
  error?: string
}

/**
 * Validates if two users have a valid parent-child relationship for communication
 */
export async function validateParentChildRelationship(
  fromUserId: string,
  targetUserId: string
): Promise<AuthorizedRelationship> {
  try {
    // Get both users with their relationships
    const [fromUser, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: fromUserId },
        select: { id: true, role: true, familyId: true }
      }),
      prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, role: true, familyId: true }
      })
    ])

    if (!fromUser || !targetUser) {
      return {
        isValid: false,
        error: 'One or both users not found'
      }
    }

    // Case 1: Parent sending to their child
    if (fromUser.role === 'parent' && targetUser.role === 'child' && targetUser.familyId === fromUser.familyId) {
      return {
        isValid: true,
        targetUser,
        relationship: 'parent_to_child'
      }
    }

    // Case 2: Child sending to their parent
    if (fromUser.role === 'child' && targetUser.role === 'parent' && fromUser.familyId === targetUser.familyId) {
      return {
        isValid: true,
        targetUser,
        relationship: 'child_to_parent'
      }
    }

    return {
      isValid: false,
      error: 'No valid parent-child relationship exists between users'
    }
  } catch (error) {
    console.error('❌ Failed to validate parent-child relationship:', error)
    return {
      isValid: false,
      error: 'Database error during relationship validation'
    }
  }
}

/**
 * Validates if a user has access to a specific task
 */
export async function validateTaskAccess(
  userId: string,
  taskId: string,
  requiredRole?: 'parent' | 'child'
): Promise<ResourceAuthResult> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        childId: true,
        parentIds: true
      }
    })

    if (!task) {
      return {
        isAuthorized: false,
        error: 'Task not found'
      }
    }

    // Check if user is either the child or parent of this task
    const isChild = task.childId === userId
    const isParent = task.parentIds.includes(userId)

    if (!isChild && !isParent) {
      return {
        isAuthorized: false,
        error: 'User not authorized to access this task'
      }
    }

    // Check role requirement if specified
    if (requiredRole) {
      if (requiredRole === 'child' && !isChild) {
        return {
          isAuthorized: false,
          error: 'Child role required for this operation'
        }
      }
      if (requiredRole === 'parent' && !isParent) {
        return {
          isAuthorized: false,
          error: 'Parent role required for this operation'
        }
      }
    }

    return {
      isAuthorized: true,
      resource: task
    }
  } catch (error) {
    console.error('❌ Failed to validate task access:', error)
    return {
      isAuthorized: false,
      error: 'Database error during task access validation'
    }
  }
}

/**
 * Validates if a user has access to a specific piggy bank
 */
export async function validatePiggyBankAccess(
  userId: string,
  piggyBankId: string
): Promise<ResourceAuthResult> {
  try {
    const piggyBank = await prisma.piggyBank.findUnique({
      where: { id: piggyBankId },
      include: {
        user: {
          select: { id: true, role: true, familyId: true, }
        },
      }
    })

    if (!piggyBank) {
      return {
        isAuthorized: false,
        error: 'Piggy bank not found'
      }
    }

    // Owner has full access
    if (piggyBank.userId === userId) {
      return {
        isAuthorized: true,
        resource: piggyBank
      }
    }
    

    // Parent can access child's piggy bank
    if (piggyBank.user.role === 'child') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, familyId: true }
      })
      if (piggyBank.user.familyId === user.familyId) {
      return {
        isAuthorized: true,
        resource: piggyBank
        }
      }
    }

    return {
      isAuthorized: false,
      error: 'User not authorized to access this piggy bank'
    }
  } catch (error) {
    console.error('❌ Failed to validate piggy bank access:', error)
    return {
      isAuthorized: false,
      error: 'Database error during piggy bank access validation'
    }
  }
}

/**
 * Validates if a user has access to a specific schedule
 */
export async function validateScheduleAccess(
  userId: string,
  scheduleId: string
): Promise<ResourceAuthResult> {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        user: {
          select: { id: true, role: true, familyId: true }
        }
      }
    })

    if (!schedule) {
      return {
        isAuthorized: false,
        error: 'Schedule not found'
      }
    }

    // Owner has full access
    if (schedule.userId === userId) {
      return {
        isAuthorized: true,
        resource: schedule
      }
    }

    // Parent can access child's schedule
    if (schedule.user.role === 'child') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, familyId: true }
      })
      if (schedule.user.familyId === user.familyId) {
      return {
          isAuthorized: true,
          resource: schedule
        }
      }
    }

    return {
      isAuthorized: false,
      error: 'User not authorized to access this schedule'
    }
  } catch (error) {
    console.error('❌ Failed to validate schedule access:', error)
    return {
      isAuthorized: false,
      error: 'Database error during schedule access validation'
    }
  }
}

/**
 * Derives the appropriate target user for task notifications
 */
export async function deriveTaskNotificationTarget(
  fromUserId: string,
  taskId: string,
  action: 'created' | 'completed' | 'approved' | 'rejected'
): Promise<AuthorizedRelationship> {
  try {
    const taskAuth = await validateTaskAccess(fromUserId, taskId)
    if (!taskAuth.isAuthorized || !taskAuth.resource) {
      return {
        isValid: false,
        error: taskAuth.error || 'Unauthorized task access'
      }
    }

    const task = taskAuth.resource

    // Determine target based on action and sender role
    let targetUserId: string
    
    if (action === 'created') {
      // Parent creates task -> notify child
      if (task.parentId === fromUserId) {
        targetUserId = task.childId
      } else {
        return { isValid: false, error: 'Only parents can create tasks' }
      }
    } else if (action === 'completed') {
      // Child completes task -> notify parent
      if (task.childId === fromUserId) {
        targetUserId = task.parentId
      } else {
        return { isValid: false, error: 'Only children can complete tasks' }
      }
    } else if (action === 'approved' || action === 'rejected') {
      // Parent approves/rejects task -> notify child
      if (task.parentId === fromUserId) {
        targetUserId = task.childId
      } else {
        return { isValid: false, error: 'Only parents can approve/reject tasks' }
      }
    } else {
      return { isValid: false, error: 'Invalid task action' }
    }

    // Validate the derived relationship
    return await validateParentChildRelationship(fromUserId, targetUserId)
  } catch (error) {
    console.error('❌ Failed to derive task notification target:', error)
    return {
      isValid: false,
      error: 'Database error during target derivation'
    }
  }
}

/**
 * Derives the appropriate target user for piggy bank notifications
 */
export async function derivePiggyBankNotificationTarget(
  fromUserId: string,
  piggyBankId: string,
  // action: 'deposit' | 'withdraw' | 'goal_reached'
): Promise<AuthorizedRelationship> {
  try {
    const piggyBankAuth = await validatePiggyBankAccess(fromUserId, piggyBankId)
    if (!piggyBankAuth.isAuthorized || !piggyBankAuth.resource) {
      return {
        isValid: false,
        error: piggyBankAuth.error || 'Unauthorized piggy bank access'
      }
    }

    const piggyBank = piggyBankAuth.resource

    // If this is the owner's piggy bank and they're a child, notify parent
    if (piggyBank.userId === fromUserId && piggyBank.user.role === 'child' && piggyBank.user.parentId) {
      return await validateParentChildRelationship(fromUserId, piggyBank.user.parentId)
    }

    // If this is a parent managing child's piggy bank, notify child
    if (piggyBank.user.role === 'child' && piggyBank.user.parentId === fromUserId) {
      return await validateParentChildRelationship(fromUserId, piggyBank.userId)
    }

    return {
      isValid: false,
      error: 'No valid notification target for this piggy bank action'
    }
  } catch (error) {
    console.error('❌ Failed to derive piggy bank notification target:', error)
    return {
      isValid: false,
      error: 'Database error during target derivation'
    }
  }
}

/**
 * Derives the appropriate target user for reward notifications
 */
export async function deriveRewardNotificationTarget(
  fromUserId: string,
  // rewardData: { rewardType: string; amount: number; reason: string }
): Promise<AuthorizedRelationship> {
  try {
    // Only parents can send reward notifications
    const fromUser = await prisma.user.findUnique({
      where: { id: fromUserId },
      select: { id: true, role: true  }
    })

    if (!fromUser || fromUser.role !== 'parent') {
      return {
        isValid: false,
        error: 'Only parents can send reward notifications'
      }
    }

    // For now, we'll need additional context to determine the target child
    // This would typically be provided through the reward reason or by referencing
    // a specific task/achievement. For security, we cannot trust client-provided targetUserId.
    
    return {
      isValid: false,
      error: 'Reward target must be specified through secure server-side context'
    }
  } catch (error) {
    console.error('❌ Failed to derive reward notification target:', error)
    return {
      isValid: false,
      error: 'Database error during target derivation'
    }
  }
}