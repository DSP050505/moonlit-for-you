import { Router, Request, Response } from 'express';
import prisma from '../db/database';
import { createNotification } from './notifications';

const router = Router();

// GET /api/quiz — Get quiz questions for a room
router.get('/', async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.query.roomId as string);
        if (!roomId) return res.status(400).json({ error: 'Room ID required' });

        const questions = await prisma.quizQuestion.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ questions });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).json({ error: 'Failed to fetch quiz questions' });
    }
});

// POST /api/quiz — Add a quiz question
router.post('/', async (req: Request, res: Response) => {
    try {
        const { roomId, question, options, correctIndex, createdBy } = req.body;

        const quizQuestion = await prisma.quizQuestion.create({
            data: {
                roomId: parseInt(roomId),
                question,
                options,
                correctIndex,
                createdBy: createdBy || 'you',
            },
        });

        // Trigger notification
        await createNotification(
            parseInt(roomId),
            'love', // Using love icon for quiz for now
            `${createdBy} added a new quiz question! Can you answer it? ❓`,
            { quizId: quizQuestion.id }
        );

        res.status(201).json({ question: quizQuestion });
    } catch (error) {
        console.error('Error creating quiz question:', error);
        res.status(500).json({ error: 'Failed to add quiz question' });
    }
});

export default router;
