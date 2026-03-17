import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NotificationPanel from '../notifications/NotificationPanel';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/useSocket';

// Simple metallic clink sound generator
const playClinkSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn('AudioContext not supported');
    }
};

const TopBar: React.FC = () => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { session, logout } = useAuth();
    const { socket } = useSocket();
    const [onlineRoles, setOnlineRoles] = useState<string[]>([]);

    useEffect(() => {
        if (!socket) return;

        socket.on('presence:update', (data: { online: string[] }) => {
            setOnlineRoles(data.online);
        });

        return () => { socket.off('presence:update'); };
    }, [socket]);

    // Build presence text
    const myRole = session?.user.role;
    const partnerRole = myRole === 'Rishika' ? 'DSP' : 'Rishika';
    const partnerName = partnerRole === 'DSP' ? 'Devi Sri Prasad' : 'Rishika';
    const partnerOnline = onlineRoles.includes(partnerRole);
    const bothOnline = onlineRoles.includes('Rishika') && onlineRoles.includes('DSP');

    return (
        <header className="app-topbar glass" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
            {/* App Title with 3D Spinning Moon */}
            <motion.div
                className="topbar-title"
                initial={{ opacity: 0, x: -20, rotateX: 90 }}
                animate={{ opacity: 1, x: 0, rotateX: 0 }}
                transition={{ type: "spring", damping: 15 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.02em',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                }}
            >
                <motion.div
                    animate={{ rotateY: 360, rotateZ: [0, 10, -10, 0] }}
                    transition={{ 
                        rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
                        rotateZ: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                        position: 'relative',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, #FFF8E7 0%, #F5D380 40%, #D4A855 80%, #000 100%)',
                        boxShadow: '0 0 15px rgba(245, 211, 128, 0.6), inset -5px -5px 10px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Craters for 3D illusion */}
                    <div style={{ position: 'absolute', top: '20%', left: '20%', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)' }} />
                    <div style={{ position: 'absolute', bottom: '30%', right: '25%', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(0,0,0,0.15)', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)' }} />
                </motion.div>
                <div>
                    <span style={{ color: 'var(--accent-silver)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Moonlit</span>
                    <span style={{ color: 'var(--accent-pink)', textShadow: '0 0 10px rgba(242, 167, 195, 0.5)' }}>ForRishika</span>
                </div>
            </motion.div>

            {/* Right side */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
            }}>
                {/* Online Presence Indicator */}
                <motion.div
                    className="topbar-presence"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: bothOnline
                            ? 'rgba(76, 175, 80, 0.12)'
                            : partnerOnline
                                ? 'rgba(76, 175, 80, 0.08)'
                                : 'rgba(255, 255, 255, 0.04)',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: bothOnline ? '#4CAF50' : partnerOnline ? '#4CAF50' : '#666',
                        boxShadow: (bothOnline || partnerOnline) ? '0 0 6px #4CAF50' : 'none',
                        display: 'inline-block',
                    }} />
                    <span style={{ fontFamily: 'var(--font-body)' }}>
                        {bothOnline
                            ? '💕 Both online'
                            : partnerOnline
                                ? `${partnerName} is online`
                                : `${partnerName} is offline`
                        }
                    </span>
                </motion.div>

                {/* Time Zone Widget */}
                <motion.div
                    className="topbar-time"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: '6px 12px',
                        background: 'rgba(28, 32, 56, 0.5)',
                        borderRadius: 'var(--radius-pill)',
                        border: 'var(--glass-border)',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <span>🕐</span>
                    <TimeDisplay />
                </motion.div>

                {/* Leave Room Button */}
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: 'rgba(232, 120, 138, 0.1)',
                        border: '1px solid rgba(232, 120, 138, 0.3)',
                        borderRadius: 'var(--radius-pill)',
                        color: 'var(--accent-rose)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading)'
                    }}
                >
                    🚪 Leave
                </motion.button>

                {/* 3D Metal Notification Bell */}
                <motion.button
                    whileHover={{ scale: 1.15, rotateZ: notificationsOpen ? 0 : [0, -15, 15, -10, 10, 0] }}
                    whileTap={{ scale: 0.9, rotateX: 20 }}
                    onClick={() => {
                        playClinkSound();
                        setNotificationsOpen(!notificationsOpen);
                    }}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: notificationsOpen
                            ? 'rgba(242, 167, 195, 0.2)'
                            : 'linear-gradient(135deg, rgba(200, 208, 224, 0.2), rgba(0,0,0,0.3))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: notificationsOpen 
                            ? '0 0 20px rgba(242, 167, 195, 0.4), inset 0 0 10px rgba(242, 167, 195, 0.2)' 
                            : '0 5px 15px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.3rem',
                        position: 'relative',
                        color: 'var(--text-primary)',
                        transition: 'background 0.3s ease, box-shadow 0.3s ease',
                        perspective: '500px',
                        transformStyle: 'preserve-3d',
                    }}
                    aria-label="Notifications"
                >
                    <motion.div style={{ transform: 'translateZ(10px)', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                        🔔
                    </motion.div>
                    
                    {/* Glowing Unread Badge */}
                    <motion.span
                        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--accent-pink)',
                            boxShadow: '0 0 10px var(--accent-pink), 0 0 20px var(--accent-pink)',
                            transform: 'translateZ(15px)',
                        }}
                    />
                </motion.button>
            </div>

            {/* Notification Panel */}
            <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
            />
        </header>
    );
};

/* Mini Time Display Component */
const TimeDisplay: React.FC = () => {
    const [time, setTime] = React.useState('');

    React.useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
            );
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {time && `${time} 🌙`}
        </span>
    );
};

export default TopBar;
