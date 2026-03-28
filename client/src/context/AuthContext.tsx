import React, { createContext, useContext, useState } from 'react';

// Matches Prisma schema
export type Role = 'Juliet' | 'Romeo';

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
    login: (session: RoomSession) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    login: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<RoomSession | null>(() => {
        const stored = localStorage.getItem('betweenus_session');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (newSession: RoomSession) => {
        setSession(newSession);
        localStorage.setItem('betweenus_session', JSON.stringify(newSession));
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem('betweenus_session');
    };

    return (
        <AuthContext.Provider value={{ session, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
