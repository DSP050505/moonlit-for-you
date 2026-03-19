import { Router, Request, Response } from 'express';
import prisma from '../db/database';
import { createNotification } from './notifications';

const router = Router();

// GET /api/surprises — All surprises for a room
router.get('/', async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.query.roomId as string);
        if (!roomId) {
            res.status(400).json({ error: 'roomId query param is required' });
            return;
        }

        const surprises = await (prisma as any).surprise.findMany({
            where: { roomId },
            orderBy: { revealDate: 'asc' },
        });

        const now = new Date();
        const processedSurprises = surprises.map((s: any) => ({
            ...s,
            isRevealed: now >= new Date(s.revealDate)
        }));

        res.json({ surprises: processedSurprises });
    } catch (error) {
        console.error('Error fetching surprises:', error);
        res.status(500).json({ error: 'Failed to fetch surprises' });
    }
});

// POST /api/surprises — Create a new surprise
router.post('/', async (req: Request, res: Response) => {
    try {
        const { roomId, title, content, revealDate, createdBy } = req.body;

        if (!roomId || !title || !content || !revealDate) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const surprise = await (prisma as any).surprise.create({
            data: {
                roomId: parseInt(roomId),
                title,
                content,
                revealDate: new Date(revealDate),
                createdBy: createdBy || 'unknown',
            },
        });

        // Trigger notification
        await createNotification(
            parseInt(roomId),
            'love', // Using love for surprises
            `A new surprise has been added! 🎁 It will be revealed on ${new Date(revealDate).toLocaleDateString()}.`,
            { surpriseId: surprise.id }
        );

        res.status(201).json({ surprise });
    } catch (error) {
        console.error('Error creating surprise:', error);
        res.status(500).json({ error: 'Failed to create surprise' });
    }
});

// DELETE /api/surprises/:id — Delete a surprise
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await (prisma as any).surprise.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting surprise:', error);
        res.status(500).json({ error: 'Failed to delete surprise' });
    }
});

export default router;
