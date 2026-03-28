import { Server, Socket } from 'socket.io';
import prisma from '../db/database';

export function setupChatHandler(io: Server, socket: Socket) {
    console.log(`💬 Chat handler set up for socket ${socket.id}`);
    // Handle new chat message
    socket.on('chat:message', async (data: {
        roomId: number;
        sender: string;
        content: string;
        type?: string;
        mediaUrl?: string;
    }) => {
        try {
            console.log(`💬 chat:message received from ${data.sender} in room ${data.roomId}: "${data.content.substring(0, 50)}"`);
            // Save to database
            const message = await prisma.message.create({
                data: {
                    roomId: data.roomId,
                    sender: data.sender as any,
                    content: data.content,
                    type: (data.type as any) || 'text',
                    mediaUrl: data.mediaUrl,
                },
            });

            // Check for special triggers inside this room
            const count = await prisma.message.count({ where: { roomId: data.roomId } });
            const isMilestone = count > 0 && count % 50 === 0;
            const isLoveMessage = data.content.toLowerCase().includes('i love you');

            const roomChannel = `room_${data.roomId}`;

            // Broadcast to the specific room
            io.to(roomChannel).emit('chat:message', {
                ...message,
                milestone: isMilestone ? count : null,
                confetti: isLoveMessage,
            });

            const { createNotification } = require('../routes/notifications');

            // Send notification
            if (isLoveMessage) {
                await createNotification(
                    data.roomId,
                    'love',
                    `${data.sender === 'you' ? 'Devi Sri Prasad' : 'Rishika'} said "I love you" ❤️`,
                    { messageId: message.id }
                );
            } else if (isMilestone) {
                await createNotification(
                    data.roomId,
                    'milestone',
                    `🎉 You've exchanged ${count} messages! Flowers are blooming!`,
                    { count }
                );
            } else {
                // Regular message notification
                await createNotification(
                    data.roomId,
                    'love',
                    `New message from ${data.sender === 'you' ? 'Devi Sri Prasad' : 'Rishika'} 💌`,
                    { messageId: message.id }
                );
            }
            console.log(`💬 Message saved & broadcast to room_${data.roomId}: id=${message.id}`);
        } catch (error) {
            console.error('🔥 Error handling chat message:', error);
        }
    });

    // Handle typing indicator
    socket.on('chat:typing', (data: { roomId: number; sender: string; isTyping: boolean }) => {
        console.log(`⌨️ chat:typing: ${data.sender} ${data.isTyping ? 'started' : 'stopped'} typing in room ${data.roomId}`);
        socket.to(`room_${data.roomId}`).emit('chat:typing', data);
    });

    // Handle message reactions
    socket.on('chat:reaction', async (data: {
        roomId: number;
        messageId: number;
        emoji: string;
        sender: string;
    }) => {
        try {
            const message = await prisma.message.findUnique({
                where: { id: data.messageId },
            });

            if (message) {
                const reactions = Array.isArray(message.reactions) ? message.reactions as any[] : [];
                reactions.push({ emoji: data.emoji, sender: data.sender, timestamp: new Date().toISOString() });

                await prisma.message.update({
                    where: { id: data.messageId },
                    data: { reactions },
                });
            }

            // Broadcast reaction to room
            io.to(`room_${data.roomId}`).emit('chat:reaction', data);
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    });

    // Handle read receipts
    socket.on('chat:read', async (data: { roomId: number; sender: string }) => {
        try {
            console.log(`💬 chat:read: ${data.sender} in room ${data.roomId} read all messages`);
            const partnerSender = data.sender === 'you' ? 'her' : 'you';
            
            await prisma.message.updateMany({
                where: {
                    roomId: data.roomId,
                    sender: partnerSender,
                    readAt: null
                },
                data: { readAt: new Date() }
            });

            // Notify the partner that their messages have been read
            socket.to(`room_${data.roomId}`).emit('chat:read', { 
                roomId: data.roomId, 
                reader: data.sender 
            });
        } catch (error) {
            console.error('🔥 Error handling read receipt:', error);
        }
    });

    // Handle cross-section invites
    socket.on('invite:section', (data: { roomId: number; sender: string; senderRole: string; sectionName: string; path: string }) => {
        console.log(`🔔 invite:section: ${data.senderRole} invited partner to ${data.sectionName}`);
        socket.to(`room_${data.roomId}`).emit('invite:section', data);
    });
}
