import { Server, Socket } from 'socket.io';
import { prisma } from './prisma';
import { getUserFromToken } from './auth';
import { validateParentChildRelationship, validateTaskAccess, validatePiggyBankAccess } from './websocket-auth';
import { checkRateLimit } from './websocket-rate-limiter';
import { auditMessage, auditConnection, auditAuthentication, auditAuthorization } from './websocket-audit';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: 'parent' | 'child';
  user?: any;
}

export interface WebSocketEvents {
  // 连接事件
  'join-room': { roomId: string; userId: string };
  'leave-room': { roomId: string; userId: string };
  
  // 聊天事件
  'send-message': { message: string; roomId: string; type?: string; receiverId?: string; fileUrl?: string; metadata?: any };
  'typing': { roomId: string; isTyping: boolean };
  'stop-typing': { roomId: string };
  
  // 任务事件
  'task-created': { taskId: string; roomId: string };
  'task-completed': { taskId: string; roomId: string };
  'task-approved': { taskId: string; roomId: string };
  'task-rejected': { taskId: string; roomId: string };
  
  // 存钱宝事件
  'piggybank-updated': { piggyBankId: string; amount: number; type: 'deposit' | 'withdraw' };
  'goal-reached': { piggyBankId: string; amount: number };
  
  // 直播事件
  'start-stream': { roomId: string; title: string; description?: string };
  'stream-started': { streamId: string; roomId: string };
  'stream-ended': { streamId: string; roomId: string };
  'stream-paused': { streamId: string; roomId: string };
  'stream-resumed': { streamId: string; roomId: string };
  
  // 聊天任务事件
  'chat-task-created': { taskId: string; roomId: string };
  'chat-task-accepted': { taskId: string; roomId: string };
  'chat-task-completed': { taskId: string; roomId: string };
  'chat-task-expired': { taskId: string; roomId: string };
  
  // 学习监督事件
  'study-started': { userId: string; roomId: string; subject?: string };
  'study-stopped': { userId: string; roomId: string; duration: number };
  'study-paused': { userId: string; roomId: string };

  // PK任务事件
  'pk-join': { taskId: string; userId: string; nickname: string; roomId: string };
  'pk-leave': { taskId: string; userId: string; nickname: string; roomId: string };
  'pk-start-countdown': { taskId: string; countdown: number; roomId: string };
  'pk-countdown-tick': { taskId: string; countdown: number; roomId: string };
  'pk-start': { taskId: string; roomId: string };
  'pk-answer-submitted': { taskId: string; userId: string; questionIndex: number; score: number; totalScore: number; roomId: string };
  'pk-completed': { taskId: string; userId: string; finalScore: number; rank: number; roomId: string };
  'study-resumed': { userId: string; roomId: string };
  
  // 积分事件
  'points-earned': { userId: string; points: number; reason: string };
  'achievement-unlocked': { userId: string; achievementId: string; name: string };
  
  // 系统事件
  'ping': { timestamp: number };
  'pong': { timestamp: number };
  'error': { message: string; code?: string };
}

export class WebSocketService {
  private io: Server;
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: AuthenticatedSocket) {
    try {
      // 认证
      const token = socket.handshake.auth?.['token'] || socket.handshake.headers?.['authorization']?.replace('Bearer ', '');
      
      if (!token) {
        auditConnection('', 'unknown', false, 'No token provided');
        socket.emit('error', { message: 'Authentication required', code: 'AUTH_REQUIRED' });
        socket.disconnect();
        return;
      }

      const user = await getUserFromToken(token);
      if (!user) {
        auditAuthentication(undefined, false, 'Invalid token');
        socket.emit('error', { message: 'Invalid token', code: 'INVALID_TOKEN' });
        socket.disconnect();
        return;
      }

      // 设置用户信息
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.user = user;

      // 记录连接
      this.connectedUsers.set(user.id, socket);
      auditConnection(user.id, user.role, true);

      console.log(`✅ User ${user.nickname} (${user.role}) connected: ${socket.id}`);

      // 设置事件处理器
      this.setupSocketEventHandlers(socket);

      // 发送连接成功消息
      socket.emit('connected', { 
        userId: user.id, 
        userRole: user.role,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Connection error:', error);
      auditConnection('', 'unknown', false, error instanceof Error ? error.message : 'Unknown error');
      socket.emit('error', { message: 'Connection failed', code: 'CONNECTION_FAILED' });
      socket.disconnect();
    }
  }

  private setupSocketEventHandlers(socket: AuthenticatedSocket) {
    // 加入房间
    socket.on('join-room', async (data: WebSocketEvents['join-room']) => {
      await this.handleJoinRoom(socket, data);
    });

    // 离开房间
    socket.on('leave-room', async (data: WebSocketEvents['leave-room']) => {
      await this.handleLeaveRoom(socket, data);
    });

    // 发送消息
    socket.on('send-message', async (data: WebSocketEvents['send-message']) => {
      await this.handleSendMessage(socket, data);
    });

    // 打字状态
    socket.on('typing', async (data: WebSocketEvents['typing']) => {
      await this.handleTyping(socket, data);
    });

    socket.on('stop-typing', async (data: WebSocketEvents['stop-typing']) => {
      await this.handleStopTyping(socket, data);
    });


    socket.on('request-task-progress', async (data: any) => {
      await this.handleRequestTaskProgress(socket, data);
    });

    // 任务事件
    socket.on('task-created', async (data: WebSocketEvents['task-created']) => {
      await this.handleTaskCreated(socket, data);
    });

    socket.on('task-completed', async (data: WebSocketEvents['task-completed']) => {
      await this.handleTaskCompleted(socket, data);
    });

    // 存钱宝事件
    socket.on('piggybank-updated', async (data: WebSocketEvents['piggybank-updated']) => {
      await this.handlePiggyBankUpdated(socket, data);
    });

    // 直播事件
    socket.on('start-stream', async (data: WebSocketEvents['start-stream']) => {
      await this.handleStartStream(socket, data);
    });

    // 学习监督事件
    socket.on('study-started', async (data: WebSocketEvents['study-started']) => {
      await this.handleStudyStarted(socket, data);
    });

    socket.on('study-stopped', async (data: WebSocketEvents['study-stopped']) => {
      await this.handleStudyStopped(socket, data);
    });

    // PK任务事件
    socket.on('pk-join', async (data: WebSocketEvents['pk-join']) => {
      await this.handlePKJoin(socket, data);
    });

    socket.on('pk-leave', async (data: WebSocketEvents['pk-leave']) => {
      await this.handlePKLeave(socket, data);
    });

    socket.on('pk-start-countdown', async (data: WebSocketEvents['pk-start-countdown']) => {
      await this.handlePKStartCountdown(socket, data);
    });

    socket.on('pk-answer-submitted', async (data: WebSocketEvents['pk-answer-submitted']) => {
      await this.handlePKAnswerSubmitted(socket, data);
    });

    socket.on('pk-completed', async (data: WebSocketEvents['pk-completed']) => {
      await this.handlePKCompleted(socket, data);
    });

    // 心跳检测
    socket.on('ping', (_data: WebSocketEvents['ping']) => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // 断开连接
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  private async handleJoinRoom(socket: AuthenticatedSocket, data: WebSocketEvents['join-room']) {
    try {
      if (!socket.userId) return;

      // 检查速率限制
      const rateLimit = checkRateLimit(socket.userId, 'join-room');
      if (!rateLimit.allowed) {
        auditMessage(socket.userId, socket.userRole!, 'join-room', undefined, false, rateLimit.error);
        socket.emit('error', { message: rateLimit.error, code: 'RATE_LIMIT_EXCEEDED' });
        return;
      }

      // 验证用户是否有权限加入该房间
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          id: data.roomId,
          members: {
            some: {
              userId: socket.userId,
              isActive: true
            }
          }
        }
      });

      if (!chatRoom) {
        auditAuthorization(socket.userId, socket.userRole!, 'join-room', false, undefined, 'Room not found or access denied');
        socket.emit('error', { message: 'Room not found or access denied', code: 'ROOM_ACCESS_DENIED' });
        return;
      }

      socket.join(data.roomId);
      auditMessage(socket.userId, socket.userRole!, 'join-room', undefined, true);

      // 通知房间内其他用户
      socket.to(data.roomId).emit('user-joined', {
        userId: socket.userId,
        userRole: socket.userRole,
        nickname: socket.user?.nickname,
        timestamp: Date.now()
      });

      console.log(`👥 User ${socket.userId} joined room ${data.roomId}`);

    } catch (error) {
      console.error('❌ Join room error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'join-room', undefined, false, error instanceof Error ? error.message : 'Unknown error');
      socket.emit('error', { message: 'Failed to join room', code: 'JOIN_ROOM_FAILED' });
    }
  }

  private async handleLeaveRoom(socket: AuthenticatedSocket, data: WebSocketEvents['leave-room']) {
    try {
      if (!socket.userId) return;

      socket.leave(data.roomId);
      auditMessage(socket.userId, socket.userRole!, 'leave-room', undefined, true);

      // 通知房间内其他用户
      socket.to(data.roomId).emit('user-left', {
        userId: socket.userId,
        timestamp: Date.now()
      });

      console.log(`👋 User ${socket.userId} left room ${data.roomId}`);

    } catch (error) {
      console.error('❌ Leave room error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'leave-room', undefined, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: WebSocketEvents['send-message']) {
    try {
      if (!socket.userId) return;

      // 检查速率限制
      const rateLimit = checkRateLimit(socket.userId, 'real_time_chat');
      if (!rateLimit.allowed) {
        auditMessage(socket.userId, socket.userRole!, 'send-message', undefined, false, rateLimit.error);
        socket.emit('error', { message: rateLimit.error, code: 'RATE_LIMIT_EXCEEDED' });
        return;
      }

      // 验证用户是否有权限在该房间发送消息
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          id: data.roomId,
          members: {
            some: {
              userId: socket.userId,
              isActive: true
            }
          }
        }
      });

      if (!chatRoom) {
        auditAuthorization(socket.userId, socket.userRole!, 'send-message', false, undefined, 'Room not found or access denied');
        socket.emit('error', { message: 'Room not found or access denied', code: 'ROOM_ACCESS_DENIED' });
        return;
      }

      // 如果是私聊，验证接收者
      if (data.receiverId && data.receiverId !== socket.userId) {
        const relationship = await validateParentChildRelationship(socket.userId, data.receiverId);
        if (!relationship.isValid) {
          auditAuthorization(socket.userId, socket.userRole!, 'send-message', false, data.receiverId, 'Invalid relationship with receiver');
          socket.emit('error', { message: 'Invalid relationship with receiver', code: 'INVALID_RELATIONSHIP' });
          return;
        }
      }

      // 创建消息记录
      const message = await prisma.chatMessage.create({
        data: {
          chatRoomId: data.roomId,
          senderId: socket.userId,
          receiverId: data.receiverId || null,
          type: (data.type as any) || 'text',
          content: data.message,
          fileUrl: data.fileUrl || null,
          metadata: data.metadata || null
        },
        include: {
          sender: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
              role: true
            }
          }
        }
      });

      auditMessage(socket.userId, socket.userRole!, 'send-message', data.receiverId, true);

      // 广播消息
      const messageData = {
        id: message.id,
        content: message.content,
        type: message.type,
        sender: message.sender,
        receiverId: message.receiverId,
        fileUrl: message.fileUrl,
        metadata: message.metadata,
        timestamp: message.createdAt.getTime()
      };

      if (data.receiverId) {
        // 私聊消息
        socket.to(data.receiverId).emit('new-message', messageData);
        socket.emit('message-sent', messageData);
      } else {
        // 群聊消息
        socket.to(data.roomId).emit('new-message', messageData);
        socket.emit('message-sent', messageData);
      }

      console.log(`💬 Message sent in room ${data.roomId} by ${socket.userId}`);

    } catch (error) {
      console.error('❌ Send message error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'send-message', undefined, false, error instanceof Error ? error.message : 'Unknown error');
      socket.emit('error', { message: 'Failed to send message', code: 'SEND_MESSAGE_FAILED' });
    }
  }

  private async handleTyping(socket: AuthenticatedSocket, data: WebSocketEvents['typing']) {
    try {
      if (!socket.userId) return;

      socket.to(data.roomId).emit('user-typing', {
        userId: socket.userId,
        nickname: socket.user?.nickname,
        isTyping: data.isTyping,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Typing error:', error);
    }
  }

  private async handleStopTyping(socket: AuthenticatedSocket, data: WebSocketEvents['stop-typing']) {
    try {
      if (!socket.userId) return;

      socket.to(data.roomId).emit('user-stopped-typing', {
        userId: socket.userId,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Stop typing error:', error);
    }
  }

  private async handleTaskCreated(socket: AuthenticatedSocket, data: WebSocketEvents['task-created']) {
    try {
      if (!socket.userId) return;

      // 验证任务访问权限
      const taskAuth = await validateTaskAccess(socket.userId, data.taskId);
      if (!taskAuth.isAuthorized) {
        auditAuthorization(socket.userId, socket.userRole!, 'task-created', false, undefined, taskAuth.error);
        socket.emit('error', { message: taskAuth.error, code: 'TASK_ACCESS_DENIED' });
        return;
      }

      const task = taskAuth.resource;
      
      // 通知相关用户
      const targetUserId = task.childId === socket.userId ? task.parentId : task.childId;
      const targetSocket = this.connectedUsers.get(targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('task-created', {
          taskId: data.taskId,
          title: task.title,
          description: task.description,
          rewardPoints: task.rewardPoints,
          timestamp: Date.now()
        });
      }

      auditMessage(socket.userId, socket.userRole!, 'task-created', targetUserId, true);

    } catch (error) {
      console.error('❌ Task created error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'task-created', undefined, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handleTaskCompleted(socket: AuthenticatedSocket, data: WebSocketEvents['task-completed']) {
    try {
      if (!socket.userId) return;

      // 验证任务访问权限
      const taskAuth = await validateTaskAccess(socket.userId, data.taskId);
      if (!taskAuth.isAuthorized) {
        auditAuthorization(socket.userId, socket.userRole!, 'task-completed', false, undefined, taskAuth.error);
        socket.emit('error', { message: taskAuth.error, code: 'TASK_ACCESS_DENIED' });
        return;
      }

      const task = taskAuth.resource;
      
      // 通知相关用户
      const targetUserId = task.childId === socket.userId ? task.parentId : task.childId;
      const targetSocket = this.connectedUsers.get(targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('task-completed', {
          taskId: data.taskId,
          title: task.title,
          completedBy: socket.user?.nickname,
          timestamp: Date.now()
        });
      }

      auditMessage(socket.userId, socket.userRole!, 'task-completed', targetUserId, true);

    } catch (error) {
      console.error('❌ Task completed error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'task-completed', undefined, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handlePiggyBankUpdated(socket: AuthenticatedSocket, data: WebSocketEvents['piggybank-updated']) {
    try {
      if (!socket.userId) return;

      // 验证存钱宝访问权限
      const piggyBankAuth = await validatePiggyBankAccess(socket.userId, data.piggyBankId);
      if (!piggyBankAuth.isAuthorized) {
        auditAuthorization(socket.userId, socket.userRole!, 'piggybank-updated', false, undefined, piggyBankAuth.error);
        socket.emit('error', { message: piggyBankAuth.error, code: 'PIGGYBANK_ACCESS_DENIED' });
        return;
      }

      const piggyBank = piggyBankAuth.resource;
      
      // 通知相关用户
      let targetUserId: string | undefined;
      if (piggyBank.user.role === 'child' && piggyBank.user.parentId) {
        targetUserId = piggyBank.user.parentId;
      } else if (piggyBank.user.role === 'parent') {
        targetUserId = piggyBank.userId;
      }

      if (targetUserId) {
        const targetSocket = this.connectedUsers.get(targetUserId);
        if (targetSocket) {
          targetSocket.emit('piggybank-updated', {
            piggyBankId: data.piggyBankId,
            amount: data.amount,
            type: data.type,
            timestamp: Date.now()
          });
        }
      }

      auditMessage(socket.userId, socket.userRole!, 'piggybank-updated', targetUserId, true);

    } catch (error) {
      console.error('❌ Piggy bank updated error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'piggybank-updated', undefined, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handleStartStream(socket: AuthenticatedSocket, data: WebSocketEvents['start-stream']) {
    try {
      if (!socket.userId) return;

      // 验证用户是否有权限在该房间开始直播
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          id: data.roomId,
          members: {
            some: {
              userId: socket.userId,
              isActive: true
            }
          }
        }
      });

      if (!chatRoom) {
        auditAuthorization(socket.userId, socket.userRole!, 'start-stream', false, undefined, 'Room not found or access denied');
        socket.emit('error', { message: 'Room not found or access denied', code: 'ROOM_ACCESS_DENIED' });
        return;
      }

      // 通知房间内其他用户
      socket.to(data.roomId).emit('stream-started', {
        streamerId: socket.userId,
        streamerName: socket.user?.nickname,
        title: data.title,
        description: data.description,
        timestamp: Date.now()
      });

      auditMessage(socket.userId, socket.userRole!, 'start-stream', undefined, true);

    } catch (error) {
      console.error('❌ Start stream error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'start-stream', undefined, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handleStudyStarted(socket: AuthenticatedSocket, data: WebSocketEvents['study-started']) {
    try {
      if (!socket.userId) return;

      // 通知房间内其他用户
      socket.to(data.roomId).emit('study-started', {
        userId: socket.userId,
        nickname: socket.user?.nickname,
        subject: data.subject,
        timestamp: Date.now()
      });

      auditMessage(socket.userId, socket.userRole!, 'study-started', undefined, true);

    } catch (error) {
      console.error('❌ Study started error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'study-started', undefined, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handleStudyStopped(socket: AuthenticatedSocket, data: WebSocketEvents['study-stopped']) {
    try {
      if (!socket.userId) return;

      // 通知房间内其他用户
      socket.to(data.roomId).emit('study-stopped', {
        userId: socket.userId,
        nickname: socket.user?.nickname,
        duration: data.duration,
        timestamp: Date.now()
      });

      auditMessage(socket.userId, socket.userRole!, 'study-stopped', undefined, true);

    } catch (error) {
      console.error('❌ Study stopped error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'study-stopped', undefined, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }


  private async handleRequestTaskProgress(socket: AuthenticatedSocket, data: any) {
    try {
      if (!socket.userId) return;

      // 检查速率限制
      const rateLimit = checkRateLimit(socket.userId, 'task_notification');
      if (!rateLimit.allowed) {
        auditMessage(socket.userId, socket.userRole!, 'request-task-progress', undefined, false, rateLimit.error);
        socket.emit('error', { message: rateLimit.error, code: 'RATE_LIMIT_EXCEEDED' });
        return;
      }

      // 验证聊天室访问权限
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          id: data.roomId,
          members: {
            some: {
              userId: socket.userId,
              isActive: true
            }
          }
        },
        include: {
          members: {
            where: { isActive: true },
            include: {
              user: {
                select: { id: true, nickname: true, role: true }
              }
            }
          }
        }
      });

      if (!chatRoom) {
        auditAuthorization(socket.userId, socket.userRole!, 'request-task-progress', false, undefined, 'Room not found or access denied');
        socket.emit('error', { message: 'Room not found or access denied', code: 'ROOM_ACCESS_DENIED' });
        return;
      }

      // 获取聊天室成员的任务进度
      const memberIds = chatRoom.members.map(m => m.user.id);
      const tasks = await prisma.task.findMany({
        where: {
          childId: { in: memberIds },
          isArchived: false // 过滤已归档的任务
        },
        include: {
          child: { select: { id: true, nickname: true } },
          approver: { select: { id: true, nickname: true } }
        }
      });

      // 计算任务进度
      const taskProgress = tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        child: task.child,
        approver: task.approver,
        dueDate: task.dueDate,
        rewardPoints: task.rewardPoints
      }));

      // 发送任务进度给请求者
      socket.emit('task-progress-response', {
        roomId: data.roomId,
        tasks: taskProgress,
        timestamp: Date.now()
      });

      auditMessage(socket.userId, socket.userRole!, 'request-task-progress', undefined, true);

    } catch (error) {
      console.error('❌ Request task progress error:', error);
      auditMessage(socket.userId || '', socket.userRole || 'unknown', 'request-task-progress', undefined, false, error instanceof Error ? error.message : 'Unknown error');
      socket.emit('error', { message: 'Failed to get task progress', code: 'TASK_PROGRESS_FAILED' });
    }
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
      auditConnection(socket.userId, socket.userRole || 'unknown', false);
      console.log(`👋 User ${socket.userId} disconnected: ${socket.id}`);
    }
  }

  // 公共方法：向特定用户发送消息
  public sendToUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  // 公共方法：向房间内所有用户发送消息
  public sendToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  // 公共方法：广播消息给所有连接的用户
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // 公共方法：获取连接的用户数量
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // 公共方法：获取连接的用户列表
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }


  // 广播任务进度更新
  public broadcastTaskProgress(roomId: string, progress: any) {
    this.io.to(roomId).emit('task-progress-updated', {
      roomId,
      progress,
      timestamp: Date.now()
    });
    
    console.log(`📊 Broadcasting task progress to room ${roomId}`);
  }

  // PK任务事件处理方法
  private async handlePKJoin(socket: AuthenticatedSocket, data: WebSocketEvents['pk-join']) {
    try {
      if (!socket.userId) return;
      
      // 加入PK房间
      socket.join(data.roomId);
      
      // 通知房间内其他用户有新用户加入
      socket.to(data.roomId).emit('pk-user-joined', {
        taskId: data.taskId,
        userId: data.userId,
        nickname: data.nickname,
        timestamp: Date.now()
      });

      console.log(`⚔️ User ${data.userId} joined PK room ${data.roomId} for task ${data.taskId}`);
    } catch (error) {
      console.error('PK join error:', error);
      socket.emit('error', { message: '加入PK失败', code: 'PK_JOIN_FAILED' });
    }
  }

  private async handlePKLeave(socket: AuthenticatedSocket, data: WebSocketEvents['pk-leave']) {
    try {
      if (!socket.userId) return;
      // 离开PK房间
      socket.leave(data.roomId);
      
      // 通知房间内其他用户有用户离开
      socket.to(data.roomId).emit('pk-user-left', {
        taskId: data.taskId,
        userId: data.userId,
        nickname: data.nickname,
        timestamp: Date.now()
      });

      console.log(`⚔️ User ${data.userId} left PK task ${data.taskId}`);
    } catch (error) {
      console.error('PK leave error:', error);
    }
  }

  private async handlePKStartCountdown(socket: AuthenticatedSocket, data: WebSocketEvents['pk-start-countdown']) {
    try {
      if (!socket.userId) return;

      
      // 广播倒计时开始
      this.io.to(data.roomId).emit('pk-countdown-started', {
        taskId: data.taskId,
        countdown: data.countdown,
        timestamp: Date.now()
      });

      // 启动倒计时
      let countdown = data.countdown;
      const countdownInterval = setInterval(() => {
        countdown--;
        
        // 广播倒计时更新
        this.io.to(data.roomId).emit('pk-countdown-tick', {
          taskId: data.taskId,
          countdown,
          timestamp: Date.now()
        });

        if (countdown <= 0) {
          clearInterval(countdownInterval);
          
          // 倒计时结束，开始PK
          this.io.to(data.roomId).emit('pk-started', {
            taskId: data.taskId,
            timestamp: Date.now()
          });
        }
      }, 1000);

      console.log(`⚔️ PK countdown started for task ${data.taskId}`);
    } catch (error) {
      console.error('PK start countdown error:', error);
      socket.emit('error', { message: '开始倒计时失败', code: 'PK_COUNTDOWN_FAILED' });
    }
  }

  private async handlePKAnswerSubmitted(socket: AuthenticatedSocket, data: WebSocketEvents['pk-answer-submitted']) {
    try {
      if (!socket.userId) return;

      
      // 广播答题进度
      socket.to(data.roomId).emit('pk-answer-updated', {
        taskId: data.taskId,
        userId: data.userId,
        questionIndex: data.questionIndex,
        score: data.score,
        totalScore: data.totalScore,
        timestamp: Date.now()
      });

      console.log(`⚔️ User ${data.userId} submitted answer for PK task ${data.taskId}`);
    } catch (error) {
      console.error('PK answer submitted error:', error);
    }
  }

  private async handlePKCompleted(socket: AuthenticatedSocket, data: WebSocketEvents['pk-completed']) {
    try {
      if (!socket.userId) return;
      
      // 广播PK完成
      socket.to(data.roomId).emit('pk-user-completed', {
        taskId: data.taskId,
        userId: data.userId,
        finalScore: data.finalScore,
        rank: data.rank,
        timestamp: Date.now()
      });

      console.log(`⚔️ User ${data.userId} completed PK task ${data.taskId} with rank ${data.rank}`);
    } catch (error) {
      console.error('PK completed error:', error);
    }
  }
}

// 导出单例实例
let wsService: WebSocketService | null = null;

export const initializeWebSocketService = (io: Server): WebSocketService => {
  if (!wsService) {
    wsService = new WebSocketService(io);
  }
  return wsService;
};

export const getWebSocketService = (): WebSocketService | null => {
  return wsService;
};
