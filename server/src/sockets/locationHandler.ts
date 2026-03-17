import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupLocationHandler(io: Server, socket: Socket) {
    socket.on('location:update', async (data: { roomId: number; userId: number; lat: number; lng: number }) => {
        try {
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
        } catch (error) {
            console.error('Error updating location:', error);
        }
    });
}
