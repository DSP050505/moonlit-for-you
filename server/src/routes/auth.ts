import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create Room
router.post('/create-room', async (req, res) => {
    console.log('📝 POST /api/auth/create-room called');
    console.log('   Request body:', JSON.stringify(req.body));
    try {
        const { name, passcode } = req.body;
        if (!name || !passcode) {
            console.log('   ❌ Missing name or passcode');
            return res.status(400).json({ error: 'Name and passcode are required' });
        }

        console.log(`   Looking for existing room: "${name}"`);
        // Check if room name exists
        const existing = await prisma.room.findUnique({ where: { name } });
        if (existing) {
            console.log(`   ❌ Room "${name}" already exists (id: ${existing.id})`);
            return res.status(400).json({ error: 'Room name already taken' });
        }

        console.log(`   Creating room: "${name}"`);
        const room = await prisma.room.create({
            data: { name, passcode }
        });
        console.log(`   ✅ Room created successfully: id=${room.id}, name="${room.name}"`);

        res.json({ room });
    } catch (err: any) {
        console.error('   🔥 Error creating room:', err.message);
        console.error('   Full error:', err);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Join Room
router.post('/join-room', async (req, res) => {
    console.log('📝 POST /api/auth/join-room called');
    console.log('   Request body:', JSON.stringify(req.body));
    try {
        const { name, passcode, role } = req.body;
        if (!name || !passcode || !role) {
            console.log('   ❌ Missing fields: name=', !!name, 'passcode=', !!passcode, 'role=', !!role);
            return res.status(400).json({ error: 'Missing fields' });
        }

        console.log(`   Looking for room: "${name}"`);
        const room = await prisma.room.findUnique({ where: { name } });
        if (!room) {
            console.log(`   ❌ Room "${name}" not found`);
            return res.status(404).json({ error: 'Room not found' });
        }
        console.log(`   ✅ Room found: id=${room.id}`);

        if (room.passcode !== passcode) {
            console.log(`   ❌ Invalid passcode for room "${name}"`);
            return res.status(401).json({ error: 'Invalid passcode' });
        }
        console.log(`   ✅ Passcode verified`);

        // Find or create user for this role in this room
        // Valid roles: "Rishika" or "DSP" (Devi Sri Prasad)
        console.log(`   Looking for existing user: role="${role}" in room ${room.id}`);
        let user = await prisma.user.findFirst({
            where: { roomId: room.id, role }
        });

        if (!user) {
            console.log(`   Creating new user: role="${role}" in room ${room.id}`);
            user = await prisma.user.create({
                data: { role, roomId: room.id }
            });
            console.log(`   ✅ User created: id=${user.id}`);
        } else {
            console.log(`   ✅ User found: id=${user.id}`);
        }

        console.log(`   ✅ Join successful: room=${room.id}, user=${user.id}, role=${role}`);
        res.json({ room, user });
    } catch (err: any) {
        console.error('   🔥 Error joining room:', err.message);
        console.error('   Full error:', err);
        res.status(500).json({ error: 'Failed to join room' });
    }
});

export default router;
