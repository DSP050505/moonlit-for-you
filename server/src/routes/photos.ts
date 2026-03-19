import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../db/database';

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
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

// GET /api/photos — All photos for a room
router.get('/', async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.query.roomId as string);
        if (!roomId) {
            res.status(400).json({ error: 'roomId query param is required' });
            return;
        }

        const photos = await prisma.photo.findMany({
            where: { roomId },
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
                uploadedBy: uploadedBy || 'unknown',
                takenAt: takenAt ? new Date(takenAt) : null,
            },
        });

        res.status(201).json({ photo });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// DELETE /api/photos/:id — Delete a photo
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        console.log(`🗑️ DELETE /api/photos/${id} requested`);

        if (!id || isNaN(id)) {
            res.status(400).json({ error: 'Invalid photo ID' });
            return;
        }

        const photo = await prisma.photo.findUnique({ where: { id } });
        if (!photo) {
            console.log(`🗑️ Photo ${id} not found in DB`);
            res.status(404).json({ error: 'Photo not found' });
            return;
        }

        // Delete the file from disk (non-fatal if fails)
        try {
            const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
            const filename = photo.url.replace('/uploads/', '');
            const filePath = path.join(uploadsDir, filename);
            console.log(`🗑️ Attempting to delete file: ${filePath}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ File deleted successfully`);
            } else {
                console.log(`🗑️ File not found on disk (already gone)`);
            }
        } catch (fileErr) {
            console.warn('⚠️ Could not delete file from disk:', fileErr);
        }

        await prisma.photo.delete({ where: { id } });
        console.log(`🗑️ Photo ${id} deleted from DB`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

export default router;
