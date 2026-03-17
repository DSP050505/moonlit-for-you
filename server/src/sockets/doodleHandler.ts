import { Server, Socket } from 'socket.io';

export function setupDoodleHandler(io: Server, socket: Socket) {
    const roomId = socket.handshake.query.roomId as string | undefined;
    const roomChannel = roomId ? `room_${roomId}` : null;
    const userRole = socket.handshake.query.userRole as string || 'unknown';

    // Handle drawing strokes — room-scoped
    socket.on('doodle:stroke', (data: {
        points: Array<{ x: number; y: number }>;
        color: string;
        size: number;
    }) => {
        if (!roomChannel) return;
        socket.to(roomChannel).emit('doodle:stroke', data);
    });

    // Handle canvas clear — room-scoped
    socket.on('doodle:clear', () => {
        if (!roomChannel) return;
        socket.to(roomChannel).emit('doodle:clear', {});
    });

    // Handle new round (word chosen, drawing started) — room-scoped
    socket.on('doodle:newRound', (data: { drawer: string }) => {
        if (!roomChannel) return;
        console.log(`🎨 Doodle: ${data.drawer} is drawing in ${roomChannel}`);
        socket.to(roomChannel).emit('doodle:newRound', data);
    });

    // Handle guess submitted — room-scoped
    socket.on('doodle:guess', (data: { guesser: string; guess: string }) => {
        if (!roomChannel) return;
        console.log(`🎨 Doodle guess in ${roomChannel}: "${data.guess}" by ${data.guesser}`);
        socket.to(roomChannel).emit('doodle:guess', data);
    });

    // Handle word reveal (round end) — room-scoped
    socket.on('doodle:reveal', (data: { word: string; drawer: string }) => {
        if (!roomChannel) return;
        console.log(`🎨 Doodle reveal in ${roomChannel}: "${data.word}"`);
        socket.to(roomChannel).emit('doodle:reveal', data);

        io.to(roomChannel).emit('notification:new', {
            type: 'doodle',
            message: `🎨 The word was "${data.word}"!`,
            timestamp: new Date().toISOString(),
        });
    });
}
