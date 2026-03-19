import { Router, Request, Response } from 'express';
import prisma from '../db/database';

const router = Router();

// GET /api/letters — All letters (newest first)
router.get('/', async (_req: Request, res: Response) => {
    try {
        const letters = await prisma.letter.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json({ letters });
    } catch (error) {
        console.error('Error fetching letters:', error);
        res.status(500).json({ error: 'Failed to fetch letters' });
    }
});

// POST /api/letters — Send a new letter
router.post('/', async (req: Request, res: Response) => {
    try {
        const { roomId, sender, content, topFlap, greeting, closing } = req.body;

        const letter = await prisma.letter.create({
            data: { 
                roomId: parseInt(roomId) || 1, 
                sender, 
                content,
                topFlap: topFlap || undefined,
                greeting: greeting || undefined,
                closing: closing || undefined
            },
        });

        res.status(201).json({ letter });
    } catch (error) {
        console.error('Error creating letter:', error);
        res.status(500).json({ error: 'Failed to send letter' });
    }
});

// PATCH /api/letters/:id/read — Mark letter as read
router.patch('/:id/read', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const letter = await prisma.letter.update({
            where: { id },
            data: { isRead: true },
        });
        res.json({ letter });
    } catch (error) {
        console.error('Error marking letter as read:', error);
        res.status(500).json({ error: 'Failed to update letter' });
    }
});

export default router;
