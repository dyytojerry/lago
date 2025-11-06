import crypto from 'crypto';
import { getRedisClient } from '../config/redis';
import { verifyToken, JWTPayload } from './auth';
import { logger } from '../config/logger';

/**
 * 生成Token的哈希key（用于Redis存储）
 */
function getTokenKey(token: string): string {
  // 使用SHA256哈希token，确保key的唯一性和固定长度
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return `blacklist:token:${hash}`;
}

/**
 * 将Token加入黑名单
 * @param token JWT Token
 * @param ttl 过期时间（秒），如果不提供则从token的exp计算
 */
export async function addTokenToBlacklist(token: string, ttl?: number): Promise<boolean> {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      // 如果token无效，也尝试加入黑名单（防止重放攻击）
      const key = getTokenKey(token);
      const client = getRedisClient();
      // 默认7天
      await client.setEx(key, 7 * 24 * 60 * 60, '1');
      return true;
    }

    // 计算token剩余有效时间
    let expireTime = ttl;
    if (!expireTime && payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      expireTime = Math.max(0, payload.exp - now);
    }

    // 如果token已过期，仍然加入黑名单（防止重放攻击），但设置较短的过期时间
    if (expireTime && expireTime <= 0) {
      expireTime = 24 * 60 * 60; // 1天
    }

    const key = getTokenKey(token);
    const client = getRedisClient();
    
    if (expireTime) {
      await client.setEx(key, expireTime, '1');
    } else {
      // 默认7天
      await client.setEx(key, 7 * 24 * 60 * 60, '1');
    }

    logger.info(`Token added to blacklist: ${key}`);
    return true;
  } catch (error) {
    logger.error('Failed to add token to blacklist:', error);
    // 如果Redis不可用，记录错误但不阻止退出登录
    return false;
  }
}

/**
 * 检查Token是否在黑名单中
 * @param token JWT Token
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const key = getTokenKey(token);
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Failed to check token blacklist:', error);
    // 如果Redis出错，为了安全起见，返回false（允许token通过，避免Redis故障导致所有请求被拒绝）
    // 但在生产环境中，可以考虑返回true以提高安全性
    return false;
  }
}

/**
 * 从黑名单中移除Token（用于测试或特殊情况）
 * @param token JWT Token
 */
export async function removeTokenFromBlacklist(token: string): Promise<boolean> {
  try {
    const key = getTokenKey(token);
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Failed to remove token from blacklist:', error);
    return false;
  }
}

