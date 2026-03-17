import React from 'react';
import { motion } from 'framer-motion';

interface MoonLoaderProps {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
    sm: { moon: '1.5rem', text: '0.75rem', gap: 8 },
    md: { moon: '2.5rem', text: '0.85rem', gap: 12 },
    lg: { moon: '4rem', text: '1rem', gap: 16 },
};

const MoonLoader: React.FC<MoonLoaderProps> = ({ text = 'Loading...', size = 'md' }) => {
    const config = sizeConfig[size];

    // Moon phase emojis for loading animation
    const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${config.gap}px`,
            padding: 'var(--space-8)',
        }}>
            <motion.div
                style={{ fontSize: config.moon }}
            >
                {phases.map((phase, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, display: 'none' }}
                        animate={{
                            opacity: [0, 1, 0],
                            display: 'inline',
                        }}
                        transition={{
                            duration: 0.5,
                            delay: i * 0.4,
                            repeat: Infinity,
                            repeatDelay: (phases.length - 1) * 0.4,
                        }}
                        style={{
                            position: i === 0 ? 'relative' : 'absolute',
                        }}
                    >
                        {phase}
                    </motion.span>
                ))}
            </motion.div>

            {text && (
                <motion.p
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: config.text,
                        color: 'var(--text-muted)',
                        margin: 0,
                    }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default MoonLoader;
