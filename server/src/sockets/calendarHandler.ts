import { Server, Socket } from 'socket.io';

export const setupCalendarHandler = (io: Server, socket: Socket) => {
    const roomId = socket.handshake.query.roomId as string | undefined;
    const roomChannel = roomId ? `room_${roomId}` : null;

    socket.on('countdown:set', (data: { date: string; title: string }) => {
        if (!roomChannel) return;
        console.log(`📅 countdown:set from ${socket.id} in ${roomChannel}:`, data);

        // Broadcast the update to everyone else in the room
        socket.to(roomChannel).emit('countdown:update', data);
    });
};
