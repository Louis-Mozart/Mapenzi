import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: id || req.userId },
      include: {
        photos: { orderBy: { order: 'asc' } },
        interests: { include: { interest: true } },
      },
    });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: (err as Error).message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name, bio, occupation, education, location,
      latitude, longitude, minAge, maxAge, maxDistance, interests,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name, bio, occupation, education, location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        minAge: minAge ? parseInt(minAge) : undefined,
        maxAge: maxAge ? parseInt(maxAge) : undefined,
        maxDistance: maxDistance ? parseInt(maxDistance) : undefined,
      },
      include: {
        photos: { orderBy: { order: 'asc' } },
        interests: { include: { interest: true } },
      },
    });

    // Update interests if provided
    if (interests && Array.isArray(interests)) {
      await prisma.userInterest.deleteMany({ where: { userId: req.userId } });
      for (const name of interests) {
        let interest = await prisma.interest.findUnique({ where: { name } });
        if (!interest) interest = await prisma.interest.create({ data: { name } });
        await prisma.userInterest.create({
          data: { userId: req.userId!, interestId: interest.id },
        });
      }
    }

    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: (err as Error).message });
  }
};

export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url, publicId, isMain } = req.body;

    if (isMain) {
      await prisma.photo.updateMany({
        where: { userId: req.userId },
        data: { isMain: false },
      });
    }

    const count = await prisma.photo.count({ where: { userId: req.userId } });
    const photo = await prisma.photo.create({
      data: {
        url,
        publicId,
        isMain: isMain || count === 0,
        order: count,
        userId: req.userId!,
      },
    });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload photo', error: (err as Error).message });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId: req.userId },
    });
    if (!photo) { res.status(404).json({ message: 'Photo not found' }); return; }
    await prisma.photo.delete({ where: { id: photoId } });
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete photo', error: (err as Error).message });
  }
};

export const getInterests = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interests = await prisma.interest.findMany({ orderBy: { name: 'asc' } });
    res.json(interests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get interests', error: (err as Error).message });
  }
};
