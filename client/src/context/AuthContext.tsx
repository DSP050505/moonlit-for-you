import React, { createContext, useContext, useState } from 'react';

// Matches Prisma schema
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
        const stored = localStorage.getItem('moonlit_session');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (newSession: RoomSession) => {
        setSession(newSession);
        localStorage.setItem('moonlit_session', JSON.stringify(newSession));
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem('moonlit_session');
    };

    return (
        <AuthContext.Provider value={{ session, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
