import { Server, Socket } from 'socket.io';

export function setupMusicSyncHandler(io: Server, socket: Socket) {
    // Handle music sync events (play, pause, seek)
    socket.on('music:sync', (data: {
        action: 'play' | 'pause' | 'seek';
        trackId?: string;
        position?: number;
        timestamp?: string;
    }) => {
        // Broadcast to all other connected clients
        socket.broadcast.emit('music:sync', {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
        });
    });

    // Handle track change
    socket.on('music:trackChange', (data: { trackId: string; trackName: string }) => {
        socket.broadcast.emit('music:trackChange', data);

        // Send notification
        io.emit('notification:new', {
            type: 'music',
            message: `🎵 Now playing: ${data.trackName}`,
            timestamp: new Date().toISOString(),
        });
    });
}
