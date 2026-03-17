import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../context/AuthContext';
import Card from '../shared/Card';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { session, login } = useAuth();
    const [mode, setMode] = useState<'join' | 'create'>('join');
    const [roomName, setRoomName] = useState('');
    const [passcode, setPasscode] = useState('');
    const [role, setRole] = useState<Role>('Rishika');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (session) {
        return <>{children}</>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const endpoint = mode === 'join' ? '/api/auth/join-room' : '/api/auth/create-room';
            const body = mode === 'join'
                ? { name: roomName, passcode, role }
                : { name: roomName, passcode };

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (mode === 'create') {
                // After creating, automatically join as the selected role
                const joinRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/join-room`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: roomName, passcode, role }),
                });
                const joinData = await joinRes.json();
                if (!joinRes.ok) throw new Error(joinData.error);
                login({ room: joinData.room, user: joinData.user });
            } else {
                login({ room: data.room, user: data.user });
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
        }}>
            {/* Animated CSS Background */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 20%, #151A30 0%, #0B0E1A 60%, #060812 100%)',
                overflow: 'hidden',
            }}>
                {/* CSS Stars */}
                {Array.from({ length: 80 }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: `${1 + Math.random() * 2}px`,
                        height: `${1 + Math.random() * 2}px`,
                        borderRadius: '50%',
                        background: i % 5 === 0 ? '#F5D380' : i % 7 === 0 ? '#F2A7C3' : '#C8D0E0',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0.4 + Math.random() * 0.6,
                        animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 3}s`,
                    }} />
                ))}
                {/* CSS Moon */}
                <div style={{
                    position: 'absolute',
                    top: '10%', right: '15%',
                    width: '60px', height: '60px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #FFF8E7 0%, #F5D380 50%, #D4A855 100%)',
                    boxShadow: '0 0 40px rgba(245,211,128,0.4), 0 0 80px rgba(245,211,128,0.2)',
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}
            >
                <Card glow hover3D={false}>
                    <div style={{ padding: 'var(--space-8)' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--text-primary)',
                            textAlign: 'center',
                            fontSize: '2rem',
                            marginBottom: 'var(--space-2)'
                        }}>
                            MoonlitForRishika
                        </h1>
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--accent-pink)',
                            fontFamily: 'var(--font-handwriting)',
                            marginBottom: 'var(--space-6)',
                            fontSize: '1.2rem'
                        }}>
                            Enter our private sky ✨
                        </p>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-6)' }}>
                            <button
                                onClick={() => setMode('join')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: mode === 'join' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: mode === 'join' ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Join Room
                            </button>
                            <button
                                onClick={() => setMode('create')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: mode === 'create' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: mode === 'create' ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Create Room
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Room Name</label>
                                <input
                                    type="text"
                                    required
                                    value={roomName}
                                    onChange={e => setRoomName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontFamily: 'var(--font-mono)'
                                    }}
                                    placeholder="e.g. OurLittleWorld"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Passcode</label>
                                <input
                                    type="password"
                                    required
                                    value={passcode}
                                    onChange={e => setPasscode(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontFamily: 'var(--font-mono)'
                                    }}
                                    placeholder="Secret key..."
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>I am...</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(['Rishika', 'DSP'] as Role[]).map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: 'var(--radius-md)',
                                                border: `1px solid ${role === r ? 'var(--accent-pink)' : 'rgba(255,255,255,0.1)'}`,
                                                background: role === r ? 'rgba(242, 167, 195, 0.1)' : 'rgba(0,0,0,0.2)',
                                                color: role === r ? 'var(--accent-pink)' : 'var(--text-muted)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {r === 'DSP' ? 'Devi Sri Prasad' : r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    marginTop: '8px',
                                    padding: '14px',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    boxShadow: '0 4px 15px rgba(232, 120, 138, 0.3)',
                                }}
                            >
                                {isLoading ? 'Connecting...' : (mode === 'join' ? 'Enter Room' : 'Create & Enter')}
                            </button>
                        </form>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default AuthGuard;
