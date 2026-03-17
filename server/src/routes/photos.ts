import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../db/database';

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

const router = Router();

// GET /api/photos — All photos
router.get('/', async (_req: Request, res: Response) => {
    try {
        const photos = await prisma.photo.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json({ photos });
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// POST /api/photos — Upload photo
router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'No photo file provided' });
            return;
        }

        const { roomId, caption, uploadedBy, takenAt } = req.body;

        const photo = await prisma.photo.create({
            data: {
                roomId: parseInt(roomId) || 1,
                url: `/uploads/${file.filename}`,
                caption: caption || null,
                uploadedBy: uploadedBy || 'you',
                takenAt: takenAt ? new Date(takenAt) : null,
            },
        });

        res.status(201).json({ photo });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

export default router;
