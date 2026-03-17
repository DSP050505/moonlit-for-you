import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NotificationPanel from '../notifications/NotificationPanel';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/useSocket';

const TopBar: React.FC = () => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { session } = useAuth();
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
            {/* App Title */}
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.02em',
                }}
            >
                <span style={{ color: 'var(--accent-silver)' }}>Moonlit</span>
                <span style={{ color: 'var(--accent-pink)' }}>ForRishika</span>
                <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ marginLeft: '6px' }}
                >
                    🌙
                </motion.span>
            </motion.h1>

            {/* Right side */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
            }}>
                {/* Online Presence Indicator */}
                <motion.div
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

                {/* Notification Bell */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: notificationsOpen
                            ? 'rgba(242, 167, 195, 0.15)'
                            : 'rgba(28, 32, 56, 0.5)',
                        border: 'var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        position: 'relative',
                        color: 'var(--text-primary)',
                        transition: 'background 0.2s ease',
                    }}
                    aria-label="Notifications"
                >
                    🔔
                    {/* Unread Badge */}
                    <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--accent-pink)',
                            boxShadow: '0 0 6px var(--glow)',
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
