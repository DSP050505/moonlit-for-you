import { Router, Request, Response } from 'express';
import prisma from '../db/database';
import { createNotification } from './notifications';

const router = Router();

// GET /api/letters — All letters for a room (newest first)
router.get('/', async (req: Request, res: Response) => {
    try {
        const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
        if (!roomId) {
            return res.status(400).json({ error: 'Room ID is required' });
        }

        const letters = await prisma.letter.findMany({
            where: { roomId },
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
                roomId: parseInt(roomId), 
                sender, 
                content,
                topFlap: topFlap || undefined,
                greeting: greeting || undefined,
                closing: closing || undefined
            },
        });

        // Trigger notification
        await createNotification(
            parseInt(roomId),
            'letter',
            `Received a new letter from ${sender}! 💌`,
            sender
        );

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
