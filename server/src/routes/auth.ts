import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create Room
router.post('/create-room', async (req, res) => {
    try {
        const { name, passcode } = req.body;
        if (!name || !passcode) {
            return res.status(400).json({ error: 'Name and passcode are required' });
        }

        // Check if room name exists
        const existing = await prisma.room.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: 'Room name already taken' });
        }

        const room = await prisma.room.create({
            data: { name, passcode }
        });

        res.json({ room });
    } catch (err) {
        console.error('Error creating room:', err);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Join Room
router.post('/join-room', async (req, res) => {
    try {
        const { name, passcode, role } = req.body;
        if (!name || !passcode || !role) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const room = await prisma.room.findUnique({ where: { name } });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (room.passcode !== passcode) {
            return res.status(401).json({ error: 'Invalid passcode' });
        }

        // Find or create user for this role in this room
        // Valid roles: "Rishika" or "DSP" (Devi Sri Prasad)
        let user = await prisma.user.findFirst({
            where: { roomId: room.id, role }
        });

        if (!user) {
            user = await prisma.user.create({
                data: { role, roomId: room.id }
            });
        }

        res.json({ room, user });
    } catch (err) {
        console.error('Error joining room:', err);
        res.status(500).json({ error: 'Failed to join room' });
    }
});

export default router;
