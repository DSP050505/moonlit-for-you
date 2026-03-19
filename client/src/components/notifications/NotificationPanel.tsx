import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/useSocket';

export interface Notification {
    id: number;
    type: 'love' | 'milestone' | 'music' | 'letter' | 'wish' | 'system' | 'surprise' | 'message';
    message: string;
    timestamp?: string;
    createdAt?: string;
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
    surprise: { icon: '🎁', color: 'var(--accent-pink)' },
    message: { icon: '💬', color: 'var(--accent-lavender)' },
    system: { icon: '🌙', color: 'var(--accent-silver)' },
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const { session } = useAuth();
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!session || !isOpen) return;

        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${apiUrl}/api/notifications?roomId=${session.room.id}`);
                const data = await res.json();
                if (data.notifications) {
                    setNotifications(data.notifications);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [session, isOpen]);

    useEffect(() => {
        if (!socket) return;

        socket.on('notification:new', (newNotif: Notification) => {
            setNotifications(prev => [newNotif, ...prev]);
            
            // Play a soft sound or something? For now just visual.
        });

        return () => {
            socket.off('notification:new');
        };
    }, [socket]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllRead = async () => {
        if (!session) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await fetch(`${apiUrl}/api/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: session.room.id }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    const markRead = async (id: number) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await fetch(`${apiUrl}/api/notifications/${id}/read`, {
                method: 'PATCH',
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const timeAgo = (timestamp?: string) => {
        if (!timestamp) return 'Just now';
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
                            {isLoading && notifications.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>🌙</motion.div>
                                    <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Looking for updates...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '0.8rem' }}>No notifications yet 🕊️</p>
                                </div>
                            ) : notifications.map((notification, i) => {
                                const config = typeConfig[notification.type] || typeConfig.system;
                                return (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => markRead(notification.id)}
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
                                                {timeAgo(notification.createdAt || notification.timestamp)}
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
