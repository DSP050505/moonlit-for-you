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
                background: 'rgba(28, 32, 56, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.1)',
                borderRadius: '16px 16px 16px 4px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
                {/* Pulsing dots */}
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        animate={{
                            scale: [0.6, 1, 0.6],
                            opacity: [0.5, 1, 0.5],
                            y: [0, -4, 0]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                        style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 30% 30%, #fff, #C4B1D4 60%, #81B1EE)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.2)',
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
