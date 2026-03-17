import { Router, Request, Response } from 'express';
import prisma from '../db/database';

const router = Router();

// GET /api/quiz — Get quiz questions
router.get('/', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        // Get random questions
        const totalCount = await prisma.quizQuestion.count();
        const questions = await prisma.quizQuestion.findMany({
            take: limit,
            skip: Math.max(0, Math.floor(Math.random() * Math.max(0, totalCount - limit))),
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
                roomId: parseInt(roomId) || 1,
                question,
                options,
                correctIndex,
                createdBy: createdBy || 'you',
            },
        });

        res.status(201).json({ question: quizQuestion });
    } catch (error) {
        console.error('Error creating quiz question:', error);
        res.status(500).json({ error: 'Failed to add quiz question' });
    }
});

export default router;
