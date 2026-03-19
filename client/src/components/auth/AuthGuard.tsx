import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../context/AuthContext';

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
        }}>
            {/* The background is now fully handled by SceneProvider Global Canvas. 
                AuthGuard is just a floating HTML overlay without its own opaque background. */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(11, 14, 26, 0.4)', backdropFilter: 'blur(8px)', zIndex: 0 }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: [0, -10, 0],
                    x: shakeCount > 0 ? [-5, 5, -5, 5, 0] : 0 
                }}
                transition={{
                    opacity: { duration: 0.8, ease: "easeOut" },
                    scale: { duration: 0.8, type: "spring", bounce: 0.4 },
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: 0.4 } // Shake duration
                }}
                key={shakeCount} // Force re-render of shake animation on error
                style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', perspective: '1000px' }}
            >
                <div style={{
                    background: 'rgba(28, 32, 56, 0.4)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(242, 167, 195, 0.2)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(242,167,195,0.05)',
                    padding: 'var(--space-8)',
                    transformStyle: 'preserve-3d',
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-handwriting)',
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        fontSize: '3.5rem',
                        marginBottom: 'var(--space-2)',
                        textShadow: '0 0 15px rgba(242, 167, 195, 0.6)',
                        letterSpacing: '1px'
                    }}>
                        MoonlitForRishika
                        </h1>
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-heading)',
                            marginBottom: 'var(--space-6)',
                            fontSize: '0.9rem',
                            letterSpacing: '2px',
                            textTransform: 'uppercase'
                        }}>
                            Enter our private sky
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
                                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Room Name</label>
                                <input
                                    type="text"
                                    required
                                    value={roomName}
                                    onChange={e => setRoomName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        background: 'rgba(0,0,0,0.3)',
                                        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                                        color: 'white',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '1rem',
                                        transition: 'border 0.3s ease, box-shadow 0.3s ease',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '1px solid rgba(242,167,195,0.5)';
                                        e.target.style.boxShadow = 'inset 0 4px 10px rgba(0,0,0,0.5), 0 0 10px rgba(242,167,195,0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid rgba(255,255,255,0.05)';
                                        e.target.style.boxShadow = 'inset 0 4px 10px rgba(0,0,0,0.5)';
                                    }}
                                    placeholder="e.g. OurLittleWorld"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Passcode</label>
                                <input
                                    type="password"
                                    required
                                    value={passcode}
                                    onChange={e => setPasscode(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        background: 'rgba(0,0,0,0.3)',
                                        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                                        color: 'white',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '1rem',
                                        transition: 'border 0.3s ease, box-shadow 0.3s ease',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '1px solid rgba(242,167,195,0.5)';
                                        e.target.style.boxShadow = 'inset 0 4px 10px rgba(0,0,0,0.5), 0 0 10px rgba(242,167,195,0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid rgba(255,255,255,0.05)';
                                        e.target.style.boxShadow = 'inset 0 4px 10px rgba(0,0,0,0.5)';
                                    }}
                                    placeholder="Secret key..."
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>I am...</label>
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

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(242, 167, 195, 0.6)' }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    marginTop: '8px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'linear-gradient(135deg, rgba(232, 120, 138, 0.9), rgba(242, 167, 195, 0.9))',
                                    color: 'white',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '1.1rem',
                                    letterSpacing: '1px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    boxShadow: '0 8px 25px rgba(232, 120, 138, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)'
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
