import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export type Role = 'Rishika' | 'DSP';

export interface RoomSession {
    room: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        role: Role;
    };
}

interface AuthContextType {
    session: RoomSession | null;
    login: (session: RoomSession) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    login: async () => { },
    logout: async () => { },
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<RoomSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const stored = await SecureStore.getItemAsync('betweenus_session');
                console.log('📱 Auth: Loaded session from SecureStore');
                if (stored) {
                    setSession(JSON.parse(stored));
                }
            } catch (err) {
                console.error('📱 Auth: Error loading session', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSession();
    }, []);

    const login = async (newSession: RoomSession) => {
        setSession(newSession);
        try {
            await SecureStore.setItemAsync('betweenus_session', JSON.stringify(newSession));
            console.log('📱 Auth: Saved session to SecureStore');
        } catch (err) {
            console.error('📱 Auth: Error saving session', err);
        }
    };

    const logout = async () => {
        setSession(null);
        try {
            await SecureStore.deleteItemAsync('betweenus_session');
            console.log('📱 Auth: Cleared session from SecureStore');
        } catch (err) {
            console.error('📱 Auth: Error deleting session', err);
        }
    };

    return (
        <AuthContext.Provider value={{ session, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
