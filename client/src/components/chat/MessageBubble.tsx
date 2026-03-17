import React from 'react';
import { motion } from 'framer-motion';
import type { Message } from './ChatBox';

interface MessageBubbleProps {
    message: Message;
    onLongPress: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onLongPress }) => {
    const isYou = message.sender === 'you';
    const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
                display: 'flex',
                justifyContent: isYou ? 'flex-end' : 'flex-start',
                width: '100%',
            }}
        >
            <motion.div
                whileHover={{ scale: 1.02 }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onLongPress();
                }}
                style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: isYou
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                    background: isYou
                        ? 'linear-gradient(135deg, var(--accent-rose), rgba(232, 120, 138, 0.8))'
                        : 'linear-gradient(135deg, var(--accent-lavender), rgba(196, 177, 212, 0.8))',
                    color: isYou ? '#fff' : 'var(--bg-primary)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    position: 'relative',
                }}
            >
                {/* Message content */}
                <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                }}>
                    {message.content}
                </p>

                {/* Time & Read receipt */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px',
                }}>
                    <span style={{
                        fontSize: '0.65rem',
                        opacity: 0.7,
                    }}>
                        {time}
                    </span>
                    {isYou && (
                        <span style={{
                            fontSize: '0.65rem',
                            color: message.readAt ? '#64B5F6' : 'rgba(255,255,255,0.5)',
                        }}>
                            ✓✓
                        </span>
                    )}
                </div>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        style={{
                            position: 'absolute',
                            bottom: '-10px',
                            [isYou ? 'left' : 'right']: '8px',
                            background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-pill)',
                            padding: '2px 6px',
                            fontSize: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            gap: '2px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                    >
                        {message.reactions.map((r, i) => (
                            <span key={i}>{r.emoji}</span>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default MessageBubble;
