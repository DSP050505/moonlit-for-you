import { Server, Socket } from 'socket.io';
import prisma from '../db/database';

export function setupLocationHandler(io: Server, socket: Socket) {
    console.log(`📍 Location handler set up for socket ${socket.id}`);
    socket.on('location:update', async (data: { roomId: number; userId: number; lat: number; lng: number }) => {
        try {
            console.log(`📍 location:update from user ${data.userId} in room ${data.roomId}: lat=${data.lat}, lng=${data.lng}`);
            // Update user in DB
            await prisma.user.update({
                where: { id: data.userId },
                data: {
                    latitude: data.lat,
                    longitude: data.lng,
                    locationShared: true,
                    lastSeen: new Date(),
                }
            });

            // Broadcast to the room (to the other user)
            socket.to(`room_${data.roomId}`).emit('location:updated', {
                userId: data.userId,
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date().toISOString(),
            });
            console.log(`📍 Location updated & broadcast for user ${data.userId}`);
        } catch (error) {
            console.error('🔥 Error updating location:', error);
        }
    });
}
