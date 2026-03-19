import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Notification {
    id: number;
    type: 'love' | 'milestone' | 'music' | 'letter' | 'wish' | 'system';
    message: string;
    timestamp: string;
    isRead: boolean;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
    love: { icon: '💕', color: 'var(--accent-pink)' },
    milestone: { icon: '🎉', color: 'var(--accent-gold)' },
    music: { icon: '🎵', color: 'var(--accent-lavender)' },
    letter: { icon: '💌', color: 'var(--accent-rose)' },
    wish: { icon: '⭐', color: 'var(--accent-gold)' },
    system: { icon: '🌙', color: 'var(--accent-silver)' },
};

// Demo notifications
const initialNotifications: Notification[] = [
    { id: 1, type: 'system', message: 'Welcome to BetweenUs! 🌙', timestamp: new Date().toISOString(), isRead: false },
    { id: 2, type: 'love', message: 'Rishika just said "I love you" ❤️', timestamp: new Date(Date.now() - 300000).toISOString(), isRead: false },
    { id: 3, type: 'milestone', message: '100 messages exchanged! 🎉 The flowers are blooming!', timestamp: new Date(Date.now() - 600000).toISOString(), isRead: false },
    { id: 4, type: 'letter', message: 'You have a new letter from Rishika 💌', timestamp: new Date(Date.now() - 900000).toISOString(), isRead: true },
    { id: 5, type: 'music', message: '🎵 Now playing: A Thousand Years', timestamp: new Date(Date.now() - 1200000).toISOString(), isRead: true },
];

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const timeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            zIndex: 199,
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 20, y: -10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            top: 'calc(var(--topbar-height) + 8px)',
                            right: '16px',
                            width: '340px',
                            maxHeight: '70vh',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            border: 'var(--glass-border)',
                            boxShadow: 'var(--shadow-elevated)',
                            overflow: 'hidden',
                            zIndex: 200,
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: 'var(--space-4) var(--space-5)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <h4 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                margin: 0,
                            }}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span style={{
                                        marginLeft: '8px',
                                        background: 'var(--accent-pink)',
                                        color: 'var(--bg-primary)',
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-pill)',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </h4>
                            {unreadCount > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={markAllRead}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-pink)',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-heading)',
                                    }}
                                >
                                    Mark all read
                                </motion.button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div style={{
                            overflowY: 'auto',
                            maxHeight: 'calc(70vh - 60px)',
                        }}>
                            {notifications.map((notification, i) => {
                                const config = typeConfig[notification.type] || typeConfig.system;
                                return (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => {
                                            setNotifications(prev =>
                                                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                                            );
                                        }}
                                        style={{
                                            padding: 'var(--space-3) var(--space-5)',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            display: 'flex',
                                            gap: 'var(--space-3)',
                                            alignItems: 'flex-start',
                                            cursor: 'pointer',
                                            background: notification.isRead
                                                ? 'transparent'
                                                : 'rgba(242, 167, 195, 0.03)',
                                            transition: 'background 0.15s ease',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem', marginTop: '2px' }}>
                                            {config.icon}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                color: notification.isRead ? 'var(--text-muted)' : 'var(--text-primary)',
                                                fontSize: '0.82rem',
                                                margin: 0,
                                                lineHeight: 1.4,
                                                fontWeight: notification.isRead ? 400 : 500,
                                            }}>
                                                {notification.message}
                                            </p>
                                            <span style={{
                                                fontSize: '0.68rem',
                                                color: 'var(--text-muted)',
                                                marginTop: '2px',
                                                display: 'block',
                                            }}>
                                                {timeAgo(notification.timestamp)}
                                            </span>
                                        </div>
                                        {!notification.isRead && (
                                            <span style={{
                                                width: '6px', height: '6px', borderRadius: '50%',
                                                background: config.color,
                                                marginTop: '6px',
                                                flexShrink: 0,
                                            }} />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
