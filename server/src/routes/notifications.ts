import { Router, Request, Response } from 'express';
import prisma from '../db/database';
import { io } from '../index';

const router = Router();

// GET /api/notifications — Get notifications for a room
router.get('/', async (req: Request, res: Response) => {
    try {
        const roomIdStr = req.query.roomId as string;
        const roomId = parseInt(roomIdStr);
        if (!roomId) return res.status(400).json({ error: 'Room ID required' });

        const notifications = await prisma.notification.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.body;
        if (!roomId) return res.status(400).json({ error: 'Room ID required' });

        await prisma.notification.updateMany({
            where: { roomId, isRead: false },
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

// PATCH /api/notifications/:id/read — Mark single as read
router.patch('/:id/read', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

/**
 * Utility function to create a notification and emit via socket
 */
export const createNotification = async (roomId: number, type: string, message: string, metadata?: any) => {
    try {
        const notification = await prisma.notification.create({
            data: { roomId, type, message, metadata: metadata || {} }
        });

        // Emit to room
        if (io) {
            io.to(`room_${roomId}`).emit('notification:new', notification);
        }
        
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

export default router;
