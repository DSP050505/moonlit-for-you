import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

let socketInstance: Socket | null = null;

export const useSocket = () => {
    const { session } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(socketInstance);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!session) {
            console.log('🔌 useSocket: No session, skipping socket connection');
            return;
        }

        if (!socketInstance) {
            const socketUrl = import.meta.env.VITE_API_URL || 
                (window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`);
            console.log('🔌 useSocket: Creating new socket connection');
            console.log('   URL:', socketUrl);
            console.log('   roomId:', session.room.id, '| userId:', session.user.id, '| role:', session.user.role);

            socketInstance = io(socketUrl, {
                autoConnect: true,
                query: {
                    roomId: session.room.id,
                    userId: session.user.id,
                    userRole: session.user.role,
                }
            });

            socketInstance.on('connect', () => {
                console.log('🔌 Socket CONNECTED! id:', socketInstance?.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', (reason) => {
                console.log('🔌 Socket DISCONNECTED! reason:', reason);
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (err) => {
                console.error('🔌 Socket CONNECTION ERROR:', err.message);
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
