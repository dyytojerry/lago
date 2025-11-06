"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import io from "socket.io-client";
import { useAuth } from "@/providers/AuthProvider";

export interface WebSocketMessage {
  type: string;
  data?: any;
  status?: string;
  message?: string;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: string;
  sender: {
    id: string;
    nickname: string;
    avatarUrl?: string;
    role: string;
  };
  receiverId?: string;
  timestamp: number;
}

export interface WebSocketHookOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;

  onJoinRoom?: (socket: any, data: any) => void;
  onLeaveRoom?: (socket: any, data: any) => void;
  onConnect?: (socket: any) => void;
  onDisconnect?: () => void;
}

export interface WebSocketHook {
  socket: any | null;
  isConnected: boolean;
  isConnecting: boolean;
  currentRoom: any | null;
  subscribers: Map<string, Set<(data: any) => void>>;
  error: string | null;
  connectionCount: number;

  connect: (data?: any) => void;
  disconnect: () => void;
  subscribe: (type: string, callback: (data: any) => void) => () => void;
  emit: (event: string, data?: any) => boolean;
  on: (event: string, callback: (data: any) => void) => () => void;
}

export interface WebSocketPKHook extends WebSocketHook {
  joinRoom: (data: any) => boolean;
  leaveRoom: (data: any) => boolean;
}

export interface WebSocketChatHook extends WebSocketHook {
  lastMessage: WebSocketMessage | null;
  notifications: any[];
  // 基础功能
  send: (message: any) => boolean;
  // 聊天功能（当chatRoomId存在时可用）
  messages: ChatMessage[];
  onlineUsers: Set<string>;
  typingUsers: Set<string>;
  sendMessage: (message: string, type?: string, receiverId?: string) => boolean;
  joinRoom: (data: any) => boolean;
  leaveRoom: (data: any) => boolean;
  sendTyping: (isTyping: boolean) => boolean;
  sendChatMessage: (type: string, content: string, receiverId?: string, fileUrl?: string, metadata?: any) => boolean;
}

const DEFAULT_OPTIONS: WebSocketHookOptions = {
  autoConnect: true,
  reconnectAttempts: 5,
  reconnectDelay: 3000,
  heartbeatInterval: 30000
};

export function useWebSocketChat(options: WebSocketHookOptions = {}): WebSocketChatHook {
  const { user } = useAuth();
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  // 聊天功能状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // 通知订阅者
  const notifySubscribers = useCallback((type: string, data: any) => {
    const typeSubscribers = webSocket.subscribers.get(type);
    if (typeSubscribers) {
      typeSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`❌ WebSocket事件处理器错误 [${type}]:`, err);
        }
      });
    }
  }, []);

  const webSocket = useWebSocket({
    ...options,
    onJoinRoom: (socket, data: any) => {
      socket.emit('join-room', data);
      console.log('🏠 WebSocket: 加入房间', data.roomId);
    },
    onLeaveRoom: (socket: any, data: any) => {
      socket.emit('leave-room', data);
      console.log('🚪 WebSocket: 离开房间', data.roomId);
    },
    onConnect: (socket: any) => {
      // 通用消息处理
      const handleMessage = (event: string) => (data: any) => {
        console.log(`📨 WebSocket: 收到消息 [${event}]`, data);
        const message = { type: event, data, timestamp: Date.now() };
        setLastMessage(message);

        // 通知订阅者
        notifySubscribers(event, data);

        // 聊天消息特殊处理
        if (event === 'new-message' && data) {
          setMessages(prev => [...prev, data]);
        } else if (event === 'message-sent' && data) {
          setMessages(prev => [...prev, data]);
        }

        // 用户状态处理
        if (event === 'user-joined' && data?.userId) {
          setOnlineUsers(prev => new Set([...Array.from(prev), data.userId]));
        } else if (event === 'user-left' && data?.userId) {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }

        // 打字状态处理
        if (event === 'user-typing' && data?.userId && data.userId !== user?.id) {
          setTypingUsers(prev => new Set([...Array.from(prev), data.userId]));
        } else if (event === 'user-stopped-typing' && data?.userId) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }

        // 添加到通知列表（如果是通知类型的消息）
        if (['points-earned', 'achievement-unlocked', 'task-completed', 'goal-reached'].includes(event)) {
          setNotifications(prev => [{ ...message, id: Date.now() }, ...prev.slice(0, 9)]);
        }
      };

      // 注册常用事件
      const commonEvents = [
        'new-message',
        'message-sent',
        // 'join-room',
        // 'leave-room',
        'user-joined',
        'user-left',
        'user-typing',
        'user-stopped-typing',
        'task-created',
        'task-completed',
        'task-approved',
        'task-rejected',
        'piggybank-updated',
        'goal-reached',
        'stream-started',
        'stream-ended',
        'study-started',
        'study-stopped',
        'points-earned',
        'achievement-unlocked',
        'task-updated',
        'task-progress-updated',
        'task-progress-response',
      ];

      commonEvents.forEach(event => {
        socket.on(event, handleMessage(event));
      });
    },
    onDisconnect: () => {
      setMessages([]);
      setOnlineUsers(new Set());
      setTypingUsers(new Set());
    },
  });
  const socketRef = useRef<any | null>(null);
  socketRef.current = webSocket.socket;

  // 发送消息（兼容旧接口）
  const send = useCallback((message: any) => {
    if (!socketRef.current || !webSocket.isConnected) {
      console.warn('⚠️ WebSocket: 未连接，无法发送消息');
      return false;
    }

    try {
      // 如果是字符串，包装成对象
      if (typeof message === 'string') {
        socketRef.current.emit('message', { content: message, timestamp: Date.now() });
      } else {
        // 如果有type字段，使用type作为事件名
        const eventName = message.type || 'message';
        socketRef.current.emit(eventName, message);
      }

      console.log('📤 WebSocket: 发送消息', message);
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 发送消息失败', err);
      return false;
    }
  }, [webSocket.isConnected]);

  // 聊天功能方法
  const sendMessage = useCallback((message: string, type?: string, receiverId?: string) => {
    if (!socketRef.current || !webSocket.isConnected || !webSocket.currentRoom?.roomId) {
      console.warn('⚠️ WebSocket: 未连接或未在聊天室中，无法发送消息');
      return false;
    }

    try {
      socketRef.current.emit('send-message', {
        roomId: webSocket.currentRoom?.roomId,
        message,
        type: type || 'text',
        receiverId
      });
      console.log('📤 WebSocket: 发送聊天消息', { message, type, receiverId });
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 发送聊天消息失败', err);
      return false;
    }
  }, [webSocket.isConnected, webSocket.currentRoom?.roomId]);

  const joinRoom = useCallback((data: any) => {
    if (!socketRef.current || !webSocket.isConnected || !user) {
      console.warn('⚠️ WebSocket: 未连接，无法加入房间');
      return false;
    }

    try {
      socketRef.current.emit('join-room', data);
      console.log('🏠 WebSocket: 加入房间', data.roomId);
      webSocket.currentRoom = data;
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 加入房间失败', err);
      return false;
    }
  }, [webSocket.isConnected, user]);

  const leaveRoom = useCallback((data: any) => {
    if (!socketRef.current || !webSocket.isConnected || !user?.id) {
      console.warn('⚠️ WebSocket: 未连接，无法离开房间');
      return false;
    }

    try {
      socketRef.current.emit('leave-room', data);
      console.log('🚪 WebSocket: 离开房间', data.roomId);
      if (webSocket.currentRoom?.roomId === data.roomId) {
        webSocket.currentRoom = null;
        setMessages([]);
        setOnlineUsers(new Set());
        setTypingUsers(new Set());
      }
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 离开房间失败', err);
      return false;
    }
  }, [webSocket.isConnected, user?.id, webSocket.currentRoom?.roomId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !webSocket.isConnected || !webSocket.currentRoom?.roomId) {
      return false;
    }

    try {
      socketRef.current.emit('typing', { roomId: webSocket.currentRoom?.roomId, isTyping });
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 发送打字状态失败', err);
      return false;
    }
  }, [webSocket.isConnected, webSocket.currentRoom?.roomId]);

  const sendChatMessage = useCallback((type: string, content: string, receiverId?: string, fileUrl?: string, metadata?: any) => {
    if (!socketRef.current || !webSocket.isConnected || !webSocket.currentRoom?.roomId) {
      console.warn('⚠️ WebSocket: 未连接或未在聊天室中，无法发送消息');
      return false;
    }

    try {
      socketRef.current.emit('send-message', {
        roomId: webSocket.currentRoom?.roomId,
        message: content,
        type: type || 'text',
        receiverId,
        fileUrl,
        metadata
      });
      console.log('📤 WebSocket: 发送聊天消息', { content, type, receiverId, fileUrl, metadata });
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 发送聊天消息失败', err);
      return false;
    }
  }, [webSocket.isConnected, webSocket.currentRoom?.roomId]);


  return {
    ...webSocket,

    lastMessage,
    notifications,
    // 基础功能
    send,
    // 聊天功能
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendTyping,
    sendChatMessage
  };
}

export function useWebSocketPK(options: WebSocketHookOptions = {}): WebSocketPKHook {
  const { user } = useAuth();
  // 通知订阅者
  const notifySubscribers = useCallback((type: string, data: any) => {
    const typeSubscribers = webSocket.subscribers.get(type);
    if (typeSubscribers) {
      typeSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`❌ WebSocket事件处理器错误 [${type}]:`, err);
        }
      });
    }
  }, []);

  const webSocket = useWebSocket({
    ...options,
    onJoinRoom: (socket, data: any) => {
      socket.emit('pk-join', data);
      console.log('🏠 WebSocket: 加入房间', data.roomId);
    },
    onLeaveRoom: (socket: any, data: any) => {
      socket.emit('pk-leave', data);
      console.log('🚪 WebSocket: 离开房间', data.roomId);
    },
    onConnect: (socket: any) => {
      // 通用消息处理
      const handleMessage = (event: string) => (data: any) => {
        console.log(`📨 WebSocket: 收到消息 [${event}]`, data);

        // 通知订阅者
        notifySubscribers(event, data);
      };

      // 注册常用事件
      const commonEvents = [
        'pk-countdown-started',
        "pk-countdown-tick",
        "pk-started",
        "pk-user-joined",
        "pk-user-left",
        "pk-answer-updated",
        "pk-user-completed"
      ];
      commonEvents.forEach(event => {
        socket.on(event, handleMessage(event));
      });
    },
    onDisconnect: () => {
    },
  });
  const socketRef = useRef<any | null>(null);
  socketRef.current = webSocket.socket;

  const joinRoom = useCallback((data: any) => {
    if (!socketRef.current || !webSocket.isConnected || !user) {
      console.warn('⚠️ WebSocket: 未连接，无法加入房间');
      return false;
    }

    try {
      socketRef.current.emit('pk-join', data);
      console.log('🏠 WebSocket: 加入房间', data.roomId);
      webSocket.currentRoom = data;
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 加入房间失败', err);
      return false;
    }
  }, [webSocket.isConnected, user]);

  const leaveRoom = useCallback((data: any) => {
    if (!socketRef.current || !webSocket.isConnected || !user) {
      console.warn('⚠️ WebSocket: 未连接，无法离开房间');
      return false;
    }

    try {
      socketRef.current.emit('pk-leave', data);
      console.log('🚪 WebSocket: 离开房间', data.roomId);
      if (webSocket.currentRoom?.roomId === data.roomId) {
        webSocket.currentRoom = null;
      }
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 离开房间失败', err);
      return false;
    }
  }, [webSocket.isConnected, user, webSocket.currentRoom?.roomId]);


  return {
    ...webSocket,

    joinRoom,
    leaveRoom,
  };
}

export function useWebSocket(options: WebSocketHookOptions = {}): WebSocketHook {
  const { user, token } = useAuth();
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), []);

  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const currentRoomRef = useRef<any | null>(null);

  // 用于存储事件订阅者
  const subscribers = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectCount = useRef(0);
  const socketRef = useRef<any | null>(null);
  socketRef.current = socket;

  // 连接Socket.IO
  const connect = useCallback((data?: any) => {
    if (!token || !user?.id) {
      console.log('🔒 WebSocket: 需要登录才能连接');
      return;
    }

    // 如果已经连接且房间相同，直接返回
    if (socket?.connected && data?.roomId) {
      if (currentRoomRef.current?.roomId === data?.roomId) {
        console.log('🔌 WebSocket: 已经连接到相同房间');
        return;
      } else {
        console.log('🔌 WebSocket: 房间不同，先断开当前连接');
        opts.onDisconnect?.();
      }
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!socketUrl) {
      console.error('❌ WebSocket: 无法获取服务器URL');
      return;
    }

    setIsConnecting(true);
    setError(null);

    console.log('🔌 WebSocket: 开始连接...', socketUrl);

    try {
      const newSocket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000
      });

      // 连接成功
      newSocket.on('connected', () => {
        console.log('✅ WebSocket: 连接成功', newSocket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        setConnectionCount(prev => prev + 1);
        reconnectCount.current = 0;
        // 如果有聊天室ID，自动加入
        if (data?.roomId && user.id) {
          opts.onJoinRoom?.(newSocket, data);
          currentRoomRef.current = data;
        } else {
          // 如果没有指定房间，设置为全局连接
          currentRoomRef.current = null;
        }
      });

      // 连接失败
      newSocket.on('connect_error', (err) => {
        console.error('❌ WebSocket: 连接失败', err);
        setIsConnected(false);
        setIsConnecting(false);
        setError(`连接失败: ${err.message}`);

        // 自动重连
        if (reconnectCount.current < (opts.reconnectAttempts || 5)) {
          reconnectCount.current++;
          console.log(`🔄 WebSocket: ${opts.reconnectDelay}ms后尝试第${reconnectCount.current}次重连`);
          setTimeout(() => {
            if (token && user.id) {
              connect();
            }
          }, opts.reconnectDelay || 3000);
        }
      });

      // 断开连接
      newSocket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket: 连接断开', reason);
        setIsConnected(false);
        setIsConnecting(false);
        opts.onDisconnect?.();

        if (reason === 'io server disconnect') {
          // 服务器主动断开，需要手动重连
          setTimeout(() => {
            if (token && user.id) {
              connect(data);
            }
          }, opts.reconnectDelay || 3000);
        }
      });

      opts.onConnect?.(newSocket);
      setSocket(newSocket);

    } catch (err) {
      console.error('❌ WebSocket: 创建连接失败', err);
      setIsConnecting(false);
      setError('创建连接失败');
    }
  }, [token, user?.id, opts]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 WebSocket: 主动断开连接');
      // 如果在聊天室中，先离开
      if (currentRoomRef.current && user?.id) {
        opts.onLeaveRoom?.(socketRef.current, currentRoomRef.current);
      }
      socketRef.current.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      currentRoomRef.current = null;
      reconnectCount.current = 0;
      opts.onDisconnect?.();
    }
  }, [user?.id]);

  // Socket.IO emit方法
  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ WebSocket: 未连接，无法发送事件');
      return false;
    }

    try {
      socketRef.current.emit(event, data);
      console.log(`📤 WebSocket: 发送事件 [${event}]`, data);
      return true;
    } catch (err) {
      console.error('❌ WebSocket: 发送事件失败', err);
      return false;
    }
  }, [isConnected]);

  // 订阅事件
  const subscribe = useCallback((type: string, callback: (data: any) => void) => {
    if (!subscribers.current.has(type)) {
      subscribers.current.set(type, new Set());
    }

    const typeSubscribers = subscribers.current.get(type)!;
    typeSubscribers.add(callback);

    console.log(`📝 WebSocket: 订阅事件 [${type}]`);

    // 返回取消订阅函数
    return () => {
      typeSubscribers.delete(callback);
      if (typeSubscribers.size === 0) {
        subscribers.current.delete(type);
      }
      console.log(`📝 WebSocket: 取消订阅事件 [${type}]`);
    };
  }, []);

  // Socket.IO on方法（别名）
  const on = useCallback((event: string, callback: (data: any) => void) => {
    return subscribe(event, callback);
  }, [subscribe]);

  // 心跳检测
  useEffect(() => {
    if (!isConnected || !socket || !opts.heartbeatInterval) return;

    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping', { timestamp: Date.now() });
      }
    }, opts.heartbeatInterval);

    return () => clearInterval(heartbeat);
  }, [isConnected, socket, opts.heartbeatInterval]);

  return {
    socket,
    isConnected,
    isConnecting,
    currentRoom: currentRoomRef.current,
    subscribers: subscribers.current,
    error,
    connectionCount,
    connect,
    disconnect,
    subscribe,
    emit,
    on,
  };
}