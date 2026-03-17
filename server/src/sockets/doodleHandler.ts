import { Server, Socket } from 'socket.io';

export function setupDoodleHandler(io: Server, socket: Socket) {
    // Handle drawing strokes
    socket.on('doodle:stroke', (data: {
        points: Array<{ x: number; y: number }>;
        color: string;
        size: number;
    }) => {
        // Broadcast stroke to all other connected clients
        socket.broadcast.emit('doodle:stroke', data);
    });

    // Handle canvas clear
    socket.on('doodle:clear', () => {
        socket.broadcast.emit('doodle:clear', {});
    });

    // Handle doodle save notification
    socket.on('doodle:saved', (data: { imageUrl: string }) => {
        io.emit('notification:new', {
            type: 'doodle',
            message: '🎨 New doodle saved!',
            timestamp: new Date().toISOString(),
        });
        socket.broadcast.emit('doodle:saved', data);
    });
}
