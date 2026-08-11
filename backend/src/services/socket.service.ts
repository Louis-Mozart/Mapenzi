import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

interface AuthSocket extends Socket {
  userId?: string;
}

export const setupSocketIO = (io: Server): void => {
  // Auth middleware for Socket.IO
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join match room for real-time messaging
    socket.on('join_match', (matchId: string) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('leave_match', (matchId: string) => {
      socket.leave(`match:${matchId}`);
    });

    // Send message via socket
    socket.on('send_message', async (data: { matchId: string; content: string }) => {
      try {
        const { matchId, content } = data;

        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [{ user1Id: socket.userId }, { user2Id: socket.userId }],
            isActive: true,
          },
        });
        if (!match) return;

        const message = await prisma.message.create({
          data: { content, matchId, senderId: socket.userId! },
          include: { sender: { select: { id: true, name: true, photos: { take: 1 } } } },
        });

        // Emit to match room
        io.to(`match:${matchId}`).emit('new_message', message);

        // Notify the other user
        const otherUserId = match.user1Id === socket.userId ? match.user2Id : match.user1Id;
        io.to(`user:${otherUserId}`).emit('message_notification', {
          matchId,
          message,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { matchId: string; isTyping: boolean }) => {
      socket.to(`match:${data.matchId}`).emit('partner_typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // User goes online
    socket.on('disconnect', async () => {
      if (socket.userId) {
        await prisma.user.update({
          where: { id: socket.userId },
          data: { lastSeen: new Date() },
        });
        console.log(`User disconnected: ${socket.userId}`);
      }
    });
  });
};
