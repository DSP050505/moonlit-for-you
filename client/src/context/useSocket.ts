import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

let socketInstance: Socket | null = null;

export const useSocket = () => {
    const { session } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(socketInstance);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!session) return;

        if (!socketInstance) {
            socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
                autoConnect: true,
                query: {
                    roomId: session.room.id,
                    userId: session.user.id,
                    userRole: session.user.role,
                }
            });

            socketInstance.on('connect', () => {
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                setIsConnected(false);
            });
        }

        setSocket(socketInstance);

        return () => {
            // Only disconnect if we really want to tear down the whole app's socket
            // For now, we keep it alive across routes.
        };
    }, [session]);

    return { socket, isConnected };
};
