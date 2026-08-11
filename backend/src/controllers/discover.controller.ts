import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Get potential matches for discovery feed
export const getDiscoverProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!currentUser) { res.status(404).json({ message: 'User not found' }); return; }

    // Get IDs of already swiped users
    const swiped = await prisma.swipe.findMany({
      where: { senderId: req.userId },
      select: { receiverId: true },
    });
    const swipedIds = swiped.map((s) => s.receiverId);
    swipedIds.push(req.userId!);

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - currentUser.maxAge);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - currentUser.minAge);

    // Determine target genders
    let genderFilter: object = {};
    if (currentUser.lookingFor === 'MEN') genderFilter = { gender: 'MALE' };
    else if (currentUser.lookingFor === 'WOMEN') genderFilter = { gender: 'FEMALE' };

    const profiles = await prisma.user.findMany({
      where: {
        id: { notIn: swipedIds },
        isActive: true,
        dateOfBirth: { gte: minDate, lte: maxDate },
        ...genderFilter,
        photos: { some: {} }, // must have at least one photo
      },
      include: {
        photos: { orderBy: { order: 'asc' } },
        interests: { include: { interest: true } },
      },
      take: 20,
    });

    const safeProfiles = profiles.map(({ password: _, ...p }) => p);
    res.json(safeProfiles);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profiles', error: (err as Error).message });
  }
};

export const swipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetId, action } = req.body;

    if (targetId === req.userId) {
      res.status(400).json({ message: 'Cannot swipe on yourself' });
      return;
    }

    // Record the swipe
    await prisma.swipe.upsert({
      where: { senderId_receiverId: { senderId: req.userId!, receiverId: targetId } },
      update: { action },
      create: { senderId: req.userId!, receiverId: targetId, action },
    });

    // Check for mutual like → create match
    if (action === 'LIKE' || action === 'SUPER_LIKE') {
      const mutualSwipe = await prisma.swipe.findFirst({
        where: {
          senderId: targetId,
          receiverId: req.userId,
          action: { in: ['LIKE', 'SUPER_LIKE'] },
        },
      });

      if (mutualSwipe) {
        const [u1, u2] = [req.userId!, targetId].sort();
        const match = await prisma.match.upsert({
          where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
          update: {},
          create: { user1Id: u1, user2Id: u2 },
          include: {
            user1: { include: { photos: { orderBy: { order: 'asc' }, take: 1 } } },
            user2: { include: { photos: { orderBy: { order: 'asc' }, take: 1 } } },
          },
        });

        // Create notifications for both users
        await prisma.notification.createMany({
          data: [
            {
              userId: req.userId!,
              type: 'MATCH',
              title: "It's a Match! 💕",
              body: `You and ${match.user2Id === req.userId ? match.user1.name : match.user2.name} liked each other`,
              data: { matchId: match.id },
            },
            {
              userId: targetId,
              type: 'MATCH',
              title: "It's a Match! 💕",
              body: `You and ${match.user1Id === targetId ? match.user2.name : match.user1.name} liked each other`,
              data: { matchId: match.id },
            },
          ],
        });

        res.json({ match: true, matchData: match });
        return;
      }
    }

    res.json({ match: false });
  } catch (err) {
    res.status(500).json({ message: 'Swipe failed', error: (err as Error).message });
  }
};
