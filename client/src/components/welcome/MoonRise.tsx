import React from 'react';
import { motion } from 'framer-motion';

interface MoonRiseProps {
    onComplete?: () => void;
}

const MoonRise: React.FC<MoonRiseProps> = ({ onComplete }) => {
    return (
        <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: 'spring',
                damping: 20,
                stiffness: 80,
                duration: 2,
            }}
            onAnimationComplete={onComplete}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
            }}
        >
            {/* Moon glow background */}
            <motion.div
                animate={{
                    boxShadow: [
                        '0 0 40px 15px rgba(200, 208, 224, 0.15)',
                        '0 0 60px 25px rgba(200, 208, 224, 0.25)',
                        '0 0 40px 15px rgba(200, 208, 224, 0.15)',
                    ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    zIndex: 0,
                }}
            />

            {/* Crescent Moon SVG */}
            <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                style={{ position: 'relative', zIndex: 1 }}
            >
                <defs>
                    <radialGradient id="moonGradient" cx="40%" cy="40%">
                        <stop offset="0%" stopColor="#F0ECD8" />
                        <stop offset="50%" stopColor="#E8E0C8" />
                        <stop offset="100%" stopColor="#C8D0E0" />
                    </radialGradient>
                    <filter id="moonGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main moon circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="url(#moonGradient)"
                    filter="url(#moonGlow)"
                />

                {/* Crescent shadow (creates crescent shape) */}
                <circle
                    cx="62"
                    cy="42"
                    r="28"
                    fill="var(--bg-primary, #0B0E1A)"
                />

                {/* Small craters for detail */}
                <circle cx="30" cy="52" r="3" fill="rgba(180, 175, 160, 0.3)" />
                <circle cx="38" cy="65" r="2" fill="rgba(180, 175, 160, 0.2)" />
                <circle cx="25" cy="45" r="1.5" fill="rgba(180, 175, 160, 0.25)" />
            </svg>
        </motion.div>
    );
};

export default MoonRise;
