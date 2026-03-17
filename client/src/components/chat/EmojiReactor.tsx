import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiReactorProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const emojis = ['❤️', '😘', '🥺', '😂', '🌙', '⭐'];

const EmojiReactor: React.FC<EmojiReactorProps> = ({ onSelect, onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                    position: 'fixed',
                    bottom: '120px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 12px',
                    display: 'flex',
                    gap: '8px',
                    boxShadow: 'var(--shadow-elevated)',
                    border: 'var(--glass-border)',
                    zIndex: 500,
                }}
            >
                {emojis.map((emoji) => (
                    <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onSelect(emoji)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.3rem',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '50%',
                            transition: 'background 0.15s ease',
                        }}
                    >
                        {emoji}
                    </motion.button>
                ))}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-pill)',
                        marginLeft: '4px',
                    }}
                >
                    ✕
                </motion.button>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmojiReactor;
