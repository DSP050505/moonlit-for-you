import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

// Import routes
import authRouter from './routes/auth';
import messagesRouter from './routes/messages';
import eventsRouter from './routes/events';
import lettersRouter from './routes/letters';
import photosRouter from './routes/photos';
import wishesRouter from './routes/wishes';
import quizRouter from './routes/quiz';
import weatherRouter from './routes/weather';

// Import socket handlers
import { setupChatHandler } from './sockets/chatHandler';
import { setupMusicSyncHandler } from './sockets/musicSyncHandler';
import { setupDoodleHandler } from './sockets/doodleHandler';
import { setupLocationHandler } from './sockets/locationHandler';

// Allowed origins
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');

console.log('========================================');
console.log('🔧 SERVER CONFIG');
console.log('========================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('CLIENT_URL env:', process.env.CLIENT_URL);
console.log('Allowed CORS origins:', allowedOrigins);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('========================================');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
});

// Middleware
app.use(cors({
    origin: allowedOrigins,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware — logs every incoming request
app.use((req, _res, next) => {
    console.log(`📥 ${req.method} ${req.url} | Origin: ${req.headers.origin || 'none'} | Body: ${JSON.stringify(req.body).substring(0, 200)}`);
    next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// REST API Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/letters', lettersRouter);
app.use('/api/photos', photosRouter);
app.use('/api/wishes', wishesRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/weather', weatherRouter);

// Health check
app.get('/api/health', (_req, res) => {
    console.log('💓 Health check hit');
    res.json({ status: 'ok', message: '🌙 MoonlitForRishika server is alive!', timestamp: new Date().toISOString() });
});

// Track who is online per room: Map<roomChannel, Set<role>>
const roomPresence: Map<string, Set<string>> = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    const roomId = socket.handshake.query.roomId as string | undefined;
    const userRole = socket.handshake.query.userRole as string | undefined;
    const roomChannel = roomId ? `room_${roomId}` : null;

    if (roomChannel && userRole) {
        socket.join(roomChannel);
        console.log(`🌙 Connected: ${socket.id} → ${roomChannel} as ${userRole}`);

        // Track presence
        if (!roomPresence.has(roomChannel)) {
            roomPresence.set(roomChannel, new Set());
        }
        roomPresence.get(roomChannel)!.add(userRole);

        // Tell everyone in the room the full presence list
        io.to(roomChannel).emit('presence:update', {
            online: Array.from(roomPresence.get(roomChannel)!),
        });
    } else {
        console.log(`🌙 Connected: ${socket.id} (No Room)`);
    }

    // Set up handlers
    setupChatHandler(io, socket);
    setupMusicSyncHandler(io, socket);
    setupDoodleHandler(io, socket);
    setupLocationHandler(io, socket);

    socket.on('disconnect', () => {
        console.log(`🌙 Disconnected: ${socket.id}`);
        if (roomChannel && userRole) {
            const members = roomPresence.get(roomChannel);
            if (members) {
                members.delete(userRole);
                if (members.size === 0) {
                    roomPresence.delete(roomChannel);
                }
            }
            // Broadcast updated presence to room
            io.to(roomChannel).emit('presence:update', {
                online: members ? Array.from(members) : [],
            });
        }
    });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`\n🌙 MoonlitForRishika server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Socket.IO: ws://localhost:${PORT}\n`);
});

export { io };
