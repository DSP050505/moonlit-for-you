import { Server, Socket } from 'socket.io';

export function setupMusicSyncHandler(io: Server, socket: Socket) {
    const roomId = socket.handshake.query.roomId as string | undefined;
    const roomChannel = roomId ? `room_${roomId}` : null;
    const userRole = socket.handshake.query.userRole as string || 'unknown';

    // Handle music sync events (play, pause, seek) — room-scoped
    socket.on('music:sync', (data: {
        action: 'play' | 'pause' | 'seek';
        youtubeId?: string;
        title?: string;
        channel?: string;
        thumbnail?: string;
        position?: number;
        timestamp?: string;
    }) => {
        if (!roomChannel) return;
        console.log(`🎵 Music sync [${roomChannel}]: ${userRole} → ${data.action} ${data.title || ''}`);
        
        // Broadcast to everyone ELSE in the room
        socket.to(roomChannel).emit('music:sync', {
            ...data,
            from: userRole,
            timestamp: data.timestamp || new Date().toISOString(),
        });
    });

    // Handle track change — room-scoped
    socket.on('music:trackChange', (data: {
        youtubeId: string;
        title: string;
        channel?: string;
        thumbnail?: string;
    }) => {
        if (!roomChannel) return;
        console.log(`🎵 Track change [${roomChannel}]: ${userRole} → "${data.title}"`);

        socket.to(roomChannel).emit('music:trackChange', {
            ...data,
            from: userRole,
        });

        // Send notification to room
        io.to(roomChannel).emit('notification:new', {
            type: 'music',
            message: `🎵 ${userRole} is playing: ${data.title}`,
            timestamp: new Date().toISOString(),
        });
    });

    // Handle queue add — room-scoped
    socket.on('music:queueAdd', (data: {
        youtubeId: string;
        title: string;
        channel?: string;
        thumbnail?: string;
    }) => {
        if (!roomChannel) return;
        console.log(`🎵 Queue add [${roomChannel}]: ${userRole} → "${data.title}"`);

        socket.to(roomChannel).emit('music:queueAdd', {
            ...data,
            from: userRole,
        });
    });
}
