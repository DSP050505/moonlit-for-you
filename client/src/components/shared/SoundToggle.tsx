import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundToggleProps {
    onToggle?: (isMuted: boolean) => void;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ onToggle }) => {
    const [isMuted, setIsMuted] = useState(true);
    const [showPrompt, setShowPrompt] = useState(true);

    const handleToggle = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        setShowPrompt(false);
        onToggle?.(newMuted);
    };

    return (
        <>
            {/* Sweet prompt to enable sound */}
            <AnimatePresence>
                {showPrompt && isMuted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                            position: 'fixed',
                            bottom: '80px',
                            right: '20px',
                            background: 'var(--glass-bg)',
                            backdropFilter: 'var(--glass-blur)',
                            WebkitBackdropFilter: 'var(--glass-blur)',
                            border: 'var(--glass-border)',
                            borderRadius: 'var(--radius-card)',
                            padding: '12px 16px',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.85rem',
                            zIndex: 999,
                            maxWidth: '200px',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <span>Want to hear something lovely? 🔊</span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPrompt(false)}
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '8px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                            }}
                        >
                            ×
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggle}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    border: 'var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 998,
                    boxShadow: isMuted ? 'var(--shadow-card)' : 'var(--shadow-glow)',
                    transition: 'box-shadow 0.3s ease',
                    color: isMuted ? 'var(--text-muted)' : 'var(--accent-pink)',
                    fontSize: '1.3rem',
                }}
                aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
                <AnimatePresence mode="wait">
                    {isMuted ? (
                        <motion.span
                            key="muted"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            🔇
                        </motion.span>
                    ) : (
                        <motion.span
                            key="unmuted"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            🔊
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
};

export default SoundToggle;
