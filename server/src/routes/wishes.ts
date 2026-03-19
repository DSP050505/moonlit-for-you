import { Router, Request, Response } from 'express';
import prisma from '../db/database';
import { createNotification } from './notifications';

const router = Router();

// GET /api/wishes — All wishes for a room
router.get('/', async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.query.roomId as string);
        if (!roomId) return res.status(400).json({ error: 'Room ID required' });

        const wishes = await prisma.wish.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ wishes });
    } catch (error) {
        console.error('Error fetching wishes:', error);
        res.status(500).json({ error: 'Failed to fetch wishes' });
    }
});

// POST /api/wishes — Add a wish
router.post('/', async (req: Request, res: Response) => {
    try {
        const { roomId, content, author } = req.body;
        const wish = await prisma.wish.create({
            data: { roomId: parseInt(roomId), content, author: author || 'you' },
        });

        // Trigger notification
        await createNotification(
            parseInt(roomId),
            'wish',
            `${author} added a new wish to the jar! ✨`,
            { wishId: wish.id }
        );

        res.status(201).json({ wish });
    } catch (error) {
        console.error('Error creating wish:', error);
        res.status(500).json({ error: 'Failed to add wish' });
    }
});

// PATCH /api/wishes/:id/reveal — Mark wish as revealed
router.patch('/:id/reveal', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const wish = await prisma.wish.update({
            where: { id },
            data: { isRevealed: true },
        });

        // Trigger notification
        await createNotification(
            wish.roomId,
            'wish',
            `A wish has been revealed: "${wish.content.substring(0, 30)}..." ⭐`,
            { wishId: wish.id }
        );

        res.json({ wish });
    } catch (error) {
        console.error('Error revealing wish:', error);
        res.status(500).json({ error: 'Failed to reveal wish' });
    }
});

export default router;
