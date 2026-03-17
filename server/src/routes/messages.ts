import { Router, Request, Response } from 'express';
import prisma from '../db/database';

const router = Router();

// GET /api/messages — Paginated message history for a room
router.get('/', async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.query.roomId as string);
        if (!roomId) return res.status(400).json({ error: 'roomId is required' });

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const messages = await prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const total = await prisma.message.count({ where: { roomId } });

        res.json({ messages: messages.reverse(), total, limit, offset });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/messages — Send a message (fallback if not using sockets directly, though normally sockets handle creation now)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { roomId, sender, content, type, mediaUrl } = req.body;
        if (!roomId) return res.status(400).json({ error: 'roomId is required' });

        const message = await prisma.message.create({
            data: {
                roomId,
                sender,
                content,
                type: type || 'text',
                mediaUrl,
            },
        });

        // Check message count for milestones
        const count = await prisma.message.count({ where: { roomId } });
        const isMilestone = count % 50 === 0;

        // Check for "I love you" trigger
        const isLoveMessage = content.toLowerCase().includes('i love you');

        res.status(201).json({
            message,
            milestone: isMilestone ? count : null,
            confetti: isLoveMessage,
        });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
