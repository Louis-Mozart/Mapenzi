import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.params;
    const page = parseInt(req.query?.page as string) || 1;
    const limit = 50;

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
        isActive: true,
      },
    });
    if (!match) { res.status(403).json({ message: 'Access denied' }); return; }

    const messages = await prisma.message.findMany({
      where: { matchId },
      include: { sender: { select: { id: true, name: true, photos: { take: 1 } } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: { matchId, senderId: { not: req.userId }, status: { not: 'READ' } },
      data: { status: 'READ' },
    });

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages', error: (err as Error).message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
        isActive: true,
      },
    });
    if (!match) { res.status(403).json({ message: 'Access denied' }); return; }

    const message = await prisma.message.create({
      data: { content, matchId, senderId: req.userId! },
      include: { sender: { select: { id: true, name: true, photos: { take: 1 } } } },
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: (err as Error).message });
  }
};
