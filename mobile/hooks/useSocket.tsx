import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!session) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        console.log(`📱 Socket: Connecting to ${API_URL}`);
        const newSocket = io(API_URL, {
            query: {
                roomId: session.room.id,
                userId: session.user.id,
                role: session.user.role,
            },
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            console.log('📱 Socket: Connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('📱 Socket: Disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('📱 Socket: Connection error', err);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [session]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
