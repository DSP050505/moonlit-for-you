import { Router, Request, Response } from 'express';
import prisma from '../db/database';

const router = Router();

// GET /api/wishes — All wishes
router.get('/', async (_req: Request, res: Response) => {
    try {
        const wishes = await prisma.wish.findMany({
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
            data: { roomId: parseInt(roomId) || 1, content, author: author || 'you' },
        });
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
        res.json({ wish });
    } catch (error) {
        console.error('Error revealing wish:', error);
        res.status(500).json({ error: 'Failed to reveal wish' });
    }
});

export default router;
