import { Router, Request, Response } from 'express';
import prisma from '../db/database';

const router = Router();

// GET /api/events — Calendar events for a month
router.get('/', async (req: Request, res: Response) => {
    try {
        const month = parseInt(req.query.month as string);
        const year = parseInt(req.query.year as string);

        let events;
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            events = await prisma.event.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: 'asc' },
            });
        } else {
            events = await prisma.event.findMany({
                orderBy: { date: 'asc' },
            });
        }

        res.json({ events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// POST /api/events — Create calendar event
router.post('/', async (req: Request, res: Response) => {
    try {
        const { roomId, title, date, type, note, createdBy } = req.body;

        const event = await prisma.event.create({
            data: {
                roomId: parseInt(roomId) || 1, // Fallback for legacy requests
                title,
                date: new Date(date),
                type: type || 'custom',
                note,
                createdBy: createdBy || 'you',
            },
        });

        res.status(201).json({ event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// DELETE /api/events/:id — Remove event
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.event.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// GET /api/events/countdown — Get the active countdown event
router.get('/countdown', async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.query.roomId as string) || 1;
        const countdown = await prisma.event.findFirst({
            where: { roomId, title: 'shared_countdown', type: 'custom' },
        });
        res.json({ countdown });
    } catch (error) {
        console.error('Error fetching countdown:', error);
        res.status(500).json({ error: 'Failed to fetch countdown' });
    }
});

// POST /api/events/countdown — Set a new countdown event (replaces old one)
router.post('/countdown', async (req: Request, res: Response) => {
    try {
        const { roomId, date, createdBy } = req.body;
        const parsedRoomId = parseInt(roomId) || 1;

        // Delete existing
        await prisma.event.deleteMany({
            where: { roomId: parsedRoomId, title: 'shared_countdown', type: 'custom' },
        });

        // Create new
        const countdown = await prisma.event.create({
            data: {
                roomId: parsedRoomId,
                title: 'shared_countdown',
                date: new Date(date),
                type: 'custom',
                note: date, // Preserve the exact ISO timestamp
                createdBy: createdBy || 'you',
            },
        });

        res.status(201).json({ countdown });
    } catch (error) {
        console.error('Error setting countdown:', error);
        res.status(500).json({ error: 'Failed to set countdown' });
    }
});

export default router;
