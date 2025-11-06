import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '@/providers/AuthProvider';

export interface OnlineUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface UseOnlineStatusOptions {
  autoConnect?: boolean;
  refreshInterval?: number;
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const { autoConnect = true, refreshInterval = 30000 } = options;
  
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用WebSocket连接
  const webSocket = useWebSocket({
    autoConnect,
    onConnect: (socket) => {
      console.log('🔌 在线状态: WebSocket连接成功');
      // 请求在线用户列表
      socket.emit('request-online-users');
    },
    onDisconnect: () => {
      console.log('🔌 在线状态: WebSocket连接断开');
      setOnlineUsers(new Map());
    }
  });

  // 监听WebSocket事件
  useEffect(() => {
    if (!webSocket.socket || !webSocket.isConnected) return;

    const socket = webSocket.socket;

    // 监听在线用户列表更新
    const handleOnlineUsersUpdate = (data: { users: OnlineUser[] }) => {
      const usersMap = new Map<string, OnlineUser>();
      data.users.forEach(user => {
        usersMap.set(user.id, user);
      });
      setOnlineUsers(usersMap);
      setError(null);
    };

    // 监听用户上线
    const handleUserOnline = (data: { userId: string; nickname: string; avatarUrl?: string }) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          id: data.userId,
          nickname: data.nickname,
          avatarUrl: data.avatarUrl,
          isOnline: true,
          lastSeen: new Date()
        });
        return newMap;
      });
    };

    // 监听用户下线
    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        const user = newMap.get(data.userId);
        if (user) {
          newMap.set(data.userId, {
            ...user,
            isOnline: false,
            lastSeen: new Date()
          });
        }
        return newMap;
      });
    };

    // 注册事件监听器
    socket.on('online-users-update', handleOnlineUsersUpdate);
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);

    // 请求初始在线用户列表
    socket.emit('request-online-users');

    return () => {
      socket.off('online-users-update', handleOnlineUsersUpdate);
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
    };
  }, [webSocket.socket, webSocket.isConnected]);

  // 定期刷新在线状态
  useEffect(() => {
    if (!webSocket.isConnected || !refreshInterval) return;

    const interval = setInterval(() => {
      if (webSocket.socket) {
        webSocket.socket.emit('request-online-users');
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [webSocket.isConnected, webSocket.socket, refreshInterval]);

  // 检查用户是否在线
  const isUserOnline = useCallback((userId: string): boolean => {
    const user = onlineUsers.get(userId);
    return user?.isOnline || false;
  }, [onlineUsers]);

  // 获取用户在线状态
  const getUserStatus = useCallback((userId: string): OnlineUser | null => {
    return onlineUsers.get(userId) || null;
  }, [onlineUsers]);

  // 获取所有在线用户
  const getOnlineUsers = useCallback((): OnlineUser[] => {
    return Array.from(onlineUsers.values()).filter(user => user.isOnline);
  }, [onlineUsers]);

  // 获取所有用户（包括离线）
  const getAllUsers = useCallback((): OnlineUser[] => {
    return Array.from(onlineUsers.values());
  }, [onlineUsers]);

  // 手动刷新在线状态
  const refreshOnlineStatus = useCallback(() => {
    if (webSocket.socket && webSocket.isConnected) {
      setIsLoading(true);
      webSocket.socket.emit('request-online-users');
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [webSocket.socket, webSocket.isConnected]);

  return {
    onlineUsers: Array.from(onlineUsers.values()),
    isUserOnline,
    getUserStatus,
    getOnlineUsers,
    getAllUsers,
    refreshOnlineStatus,
    isLoading: isLoading || webSocket.isConnecting,
    error: error || webSocket.error,
    isConnected: webSocket.isConnected
  };
}
