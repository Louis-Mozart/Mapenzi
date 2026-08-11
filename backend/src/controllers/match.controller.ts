import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
        isActive: true,
      },
      include: {
        user1: { include: { photos: { orderBy: { order: 'asc' }, take: 1 } } },
        user2: { include: { photos: { orderBy: { order: 'asc' }, take: 1 } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = matches.map((m) => {
      const isUser1 = m.user1Id === req.userId;
      const partner = isUser1 ? m.user2 : m.user1;
      const { password: _, ...safePartner } = partner;
      return {
        id: m.id,
        createdAt: m.createdAt,
        partner: safePartner,
        lastMessage: m.messages[0] || null,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get matches', error: (err as Error).message });
  }
};

export const unmatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.params;
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
      },
    });
    if (!match) { res.status(404).json({ message: 'Match not found' }); return; }
    await prisma.match.update({ where: { id: matchId }, data: { isActive: false } });
    res.json({ message: 'Unmatched successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unmatch', error: (err as Error).message });
  }
};
