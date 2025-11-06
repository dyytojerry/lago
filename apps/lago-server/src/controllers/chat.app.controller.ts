import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * 获取聊天室列表
 */
export async function getChatRooms(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
        isActive: true,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
        members: {
          where: {
            userId: { not: userId },
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({ rooms });
  } catch (error) {
    console.error('获取聊天室列表失败:', error);
    res.status(500).json({ error: '获取聊天室列表失败' });
  }
}

/**
 * 获取聊天室详情
 */
export async function getChatRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 检查用户是否是聊天室成员
    const member = await prisma.chatRoomMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: id,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: '无权限访问此聊天室' });
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            owner: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                phone: true,
                creditScore: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: '聊天室不存在' });
    }

    res.json({ room });
  } catch (error) {
    console.error('获取聊天室详情失败:', error);
    res.status(500).json({ error: '获取聊天室详情失败' });
  }
}

/**
 * 创建聊天室
 */
export async function createChatRoom(req: Request, res: Response) {
  try {
    const { productId, otherUserId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 检查是否已存在聊天室
    if (productId) {
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          productId,
          members: {
            every: {
              userId: { in: [userId, otherUserId] },
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (existingRoom && existingRoom.members.length === 2) {
        return res.json({ room: existingRoom });
      }
    } else {
      // 检查是否已存在私聊
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          productId: null,
          type: 'private',
          members: {
            every: {
              userId: { in: [userId, otherUserId] },
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (existingRoom && existingRoom.members.length === 2) {
        return res.json({ room: existingRoom });
      }
    }

    // 创建新聊天室
    const room = await prisma.chatRoom.create({
      data: {
        productId,
        type: 'private',
        members: {
          create: [
            { userId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        product: {
          include: {
            owner: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                phone: true,
                creditScore: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({ room });
  } catch (error) {
    console.error('创建聊天室失败:', error);
    res.status(500).json({ error: '创建聊天室失败' });
  }
}

/**
 * 获取聊天消息列表
 */
export async function getMessages(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      page = '1',
      limit = '50',
    } = req.query;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 检查用户是否是聊天室成员
    const member = await prisma.chatRoomMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: id,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: '无权限访问此聊天室' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { chatRoomId: id },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.chatMessage.count({ where: { chatRoomId: id } }),
    ]);

    // 标记消息为已读
    await prisma.chatMessage.updateMany({
      where: {
        chatRoomId: id,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      messages: messages.reverse(), // 反转顺序，最新的在最后
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    res.status(500).json({ error: '获取消息列表失败' });
  }
}

/**
 * 发送消息
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      content,
      type = 'text',
      fileUrl,
      productId,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 检查用户是否是聊天室成员
    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            userId: { not: userId },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: '聊天室不存在' });
    }

    const member = room.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ error: '无权限在此聊天室发送消息' });
    }

    // 获取接收者ID
    const receiver = room.members.find(m => m.userId !== userId);
    const receiverId = receiver?.userId || null;

    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId: id,
        senderId: userId,
        receiverId,
        type,
        content,
        fileUrl,
        productId,
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 更新聊天室更新时间
    await prisma.chatRoom.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // TODO: 发送WebSocket通知给接收者

    res.status(201).json({ message });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
}

