import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
    name: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ name }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '8px 0',
            }}
        >
            <div style={{
                background: 'rgba(196, 177, 212, 0.2)',
                borderRadius: '16px 16px 16px 4px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
            }}>
                {/* Pulsing dots */}
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        animate={{
                            scale: [0.6, 1, 0.6],
                            opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                        }}
                        style={{
                            display: 'inline-block',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: 'var(--accent-lavender)',
                        }}
                    />
                ))}
            </div>
            <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
            }}>
                {name} is typing...
            </span>
        </motion.div>
    );
};

export default TypingIndicator;
