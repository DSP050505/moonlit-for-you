import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../context/AuthContext';
import loginBg from '../../assets/login-bg.png';

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
    const [shakeCount, setShakeCount] = useState(0);

    const playErrorSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
            console.warn('AudioContext not supported');
        }
    };

    if (session) {
        return <>{children}</>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Use relative path to leverage Vite proxy in development
        const apiUrl = import.meta.env.VITE_API_URL || '';
        console.log('🔐 AuthGuard: handleSubmit called');
        console.log('   Mode:', mode);
        console.log('   API URL:', apiUrl);
        console.log('   Room:', roomName, '| Role:', role);

        try {
            const endpoint = mode === 'join' ? '/api/auth/join-room' : '/api/auth/create-room';
            const body = mode === 'join'
                ? { name: roomName, passcode, role }
                : { name: roomName, passcode };

            const fullUrl = `${apiUrl}${endpoint}`;
            console.log(`   Fetching: POST ${fullUrl}`);
            console.log('   Body:', JSON.stringify(body));

            const res = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            console.log(`   Response status: ${res.status} ${res.statusText}`);
            const data = await res.json();
            console.log('   Response data:', JSON.stringify(data));

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (mode === 'create') {
                // After creating, automatically join as the selected role
                const joinUrl = `${apiUrl}/api/auth/join-room`;
                console.log(`   Auto-joining: POST ${joinUrl}`);
                const joinRes = await fetch(joinUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: roomName, passcode, role }),
                });
                const joinData = await joinRes.json();
                console.log(`   Join response: ${joinRes.status}`, JSON.stringify(joinData));
                if (!joinRes.ok) throw new Error(joinData.error);
                login({ room: joinData.room, user: joinData.user });
                console.log('   ✅ Logged in after create+join');
            } else {
                login({ room: data.room, user: data.user });
                console.log('   ✅ Logged in after join');
            }

        } catch (err: any) {
            console.error('   🔥 Auth error:', err.message);
            setError(err.message);
            setShakeCount(prev => prev + 1);
            playErrorSound();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
                zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: shakeCount > 0 ? [-5, 5, -5, 5, 0] : 0
                }}
                transition={{
                    opacity: { duration: 1, ease: "easeOut" },
                    scale: { duration: 0.8, type: "spring", bounce: 0.3 },
                    x: { duration: 0.4 }
                }}
                key={shakeCount}
                style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }}
            >
                <div style={{
                    background: 'rgba(23, 27, 48, 0.15)',
                    backdropFilter: 'blur(25px)',
                    WebkitBackdropFilter: 'blur(25px)',
                    borderRadius: '40px',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: `
                        0 40px 100px rgba(0,0,0,0.5),
                        inset 0 0 20px rgba(255,255,255,0.02)
                    `,
                    padding: '50px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-handwriting)',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '4.2rem',
                        margin: '0 0 12px 0',
                        textShadow: '0 0 25px rgba(255, 255, 255, 0.7)',
                        letterSpacing: '0.5px',
                        transform: 'rotate(-2deg)'
                    }}>
                        MoonlitForRishika
                    </h1>

                    <p style={{
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: 'var(--font-heading)',
                        marginBottom: '40px',
                        fontSize: '1rem',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontWeight: '300'
                    }}>
                        Enter our private sky
                    </p>

                    <div style={{
                        display: 'flex',
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '0px', // Matches target cleaner look
                        padding: '4px',
                        marginBottom: '40px'
                    }}>
                        <button
                            onClick={() => setMode('join')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                background: mode === 'join' ? 'rgba(255,255,255,0.08)' : 'transparent',
                                color: mode === 'join' ? 'white' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '0.9rem',
                                fontWeight: mode === 'join' ? '600' : '400',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Join Room
                        </button>
                        <button
                            onClick={() => setMode('create')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                background: mode === 'create' ? 'rgba(255,255,255,0.08)' : 'transparent',
                                color: mode === 'create' ? 'white' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '0.9rem',
                                fontWeight: mode === 'create' ? '600' : '400',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Create Room
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Room Name</label>
                            <input
                                type="text"
                                required
                                value={roomName}
                                onChange={e => setRoomName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '18px 20px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(0,0,0,0.4)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                                placeholder="e.g. OurLittleWorld"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Passcode</label>
                            <input
                                type="password"
                                required
                                value={passcode}
                                onChange={e => setPasscode(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '18px 20px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(0,0,0,0.4)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                                placeholder="Secret key..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>I am...</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {(['Rishika', 'DSP'] as Role[]).map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '2px', // Sharper look for toggle
                                            border: `1.5px solid ${role === r ? 'rgba(242, 167, 195, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                                            background: role === r ? 'rgba(242, 167, 195, 0.05)' : 'rgba(0,0,0,0.2)',
                                            color: role === r ? 'white' : 'rgba(255,255,255,0.3)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            fontSize: '0.9rem'
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
                                    style={{ color: '#ff7b92', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(242, 167, 195, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: '10px',
                                padding: '20px',
                                borderRadius: '24px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #e58a9e, #db97ab)',
                                color: 'white',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                letterSpacing: '1px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                boxShadow: '0 10px 30px rgba(229, 138, 158, 0.3)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isLoading ? 'Connecting...' : (mode === 'join' ? 'Enter Room' : 'Create & Enter')}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthGuard;
