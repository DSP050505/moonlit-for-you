import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarField from './StarField';
import MoonRise from './MoonRise';

interface WelcomeSequenceProps {
    onComplete: () => void;
}

// Typewriter hook
function useTypewriter(text: string, speed: number = 80, startDelay: number = 0) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const startTimer = setTimeout(() => setStarted(true), startDelay);
        return () => clearTimeout(startTimer);
    }, [startDelay]);

    useEffect(() => {
        if (!started) return;
        if (displayedText.length >= text.length) {
            setIsComplete(true);
            return;
        }

        const timer = setTimeout(() => {
            setDisplayedText(text.slice(0, displayedText.length + 1));
        }, speed);

        return () => clearTimeout(timer);
    }, [displayedText, text, speed, started]);

    return { displayedText, isComplete };
}

type Phase = 'black' | 'stars' | 'moon' | 'text' | 'author' | 'transition';

const WelcomeSequence: React.FC<WelcomeSequenceProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<Phase>('black');
    const [showCursor, setShowCursor] = useState(true);

    // Typewriter for main text
    const mainText = useTypewriter(
        'I ♥ Rishika to the Moon & Back',
        80,
        phase === 'text' ? 0 : 999999 // Only start when in text phase
    );

    // Phase transitions
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        // 0.5s → show stars
        timers.push(setTimeout(() => setPhase('stars'), 500));

        // 1.5s → start moon rise
        timers.push(setTimeout(() => setPhase('moon'), 1500));

        return () => timers.forEach(clearTimeout);
    }, []);

    // When moon animation completes → start text
    const handleMoonComplete = useCallback(() => {
        setPhase('text');
    }, []);

    // When typewriter completes → show author
    useEffect(() => {
        if (mainText.isComplete && phase === 'text') {
            const timer = setTimeout(() => setPhase('author'), 600);
            return () => clearTimeout(timer);
        }
    }, [mainText.isComplete, phase]);

    // Author phase → transition after 4s
    useEffect(() => {
        if (phase === 'author') {
            const timer = setTimeout(() => {
                setPhase('transition');
                // Store in localStorage
                localStorage.setItem('hasSeenWelcome', 'true');
                // Complete after transition animation
                setTimeout(onComplete, 1000);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [phase, onComplete]);

    // Cursor blink
    useEffect(() => {
        const interval = setInterval(() => setShowCursor(prev => !prev), 530);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {phase !== 'transition' ? (
                <motion.div
                    key="welcome"
                    exit={{ y: '-100vh', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 100, duration: 1 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10000,
                        background: 'var(--bg-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {/* Stars */}
                    <AnimatePresence>
                        {(phase !== 'black') && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.5 }}
                                style={{ position: 'absolute', inset: 0 }}
                            >
                                <StarField count={55} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Moon */}
                    {(phase === 'moon' || phase === 'text' || phase === 'author') && (
                        <div style={{ marginBottom: '40px', zIndex: 2 }}>
                            <MoonRise onComplete={handleMoonComplete} />
                        </div>
                    )}

                    {/* Main Text with Typewriter */}
                    {(phase === 'text' || phase === 'author') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ zIndex: 2, textAlign: 'center' }}
                        >
                            <h1
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '0.03em',
                                    textShadow: '0 0 20px rgba(242, 167, 195, 0.3)',
                                }}
                            >
                                {mainText.displayedText}
                                <span
                                    style={{
                                        opacity: showCursor && !mainText.isComplete ? 1 : 0,
                                        color: 'var(--accent-pink)',
                                        fontWeight: 300,
                                        marginLeft: '2px',
                                    }}
                                >
                                    |
                                </span>
                            </h1>
                        </motion.div>
                    )}

                    {/* Author Credit */}
                    {phase === 'author' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            style={{
                                zIndex: 2,
                                marginTop: '24px',
                                textAlign: 'center',
                            }}
                        >
                            <motion.p
                                animate={{
                                    textShadow: [
                                        '0 0 5px rgba(242, 167, 195, 0.3)',
                                        '0 0 15px rgba(242, 167, 195, 0.6)',
                                        '0 0 5px rgba(242, 167, 195, 0.3)',
                                    ],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    fontFamily: 'var(--font-handwriting)',
                                    fontSize: '1.4rem',
                                    color: 'var(--accent-pink)',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                From Devi Sri Prasad
                            </motion.p>

                            {/* Floating Hearts */}
                            <div style={{ position: 'relative', height: '80px', marginTop: '16px' }}>
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                        animate={{
                                            opacity: [0, 1, 1, 0],
                                            y: [0, -30, -60, -90],
                                            scale: [0.5, 1, 1, 0.7],
                                            x: [0, (i - 2) * 20, (i - 2) * 25],
                                        }}
                                        transition={{
                                            duration: 3,
                                            delay: i * 0.2,
                                            repeat: Infinity,
                                            repeatDelay: 1,
                                        }}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            bottom: 0,
                                            fontSize: '1.5rem',
                                            transform: 'translateX(-50%)',
                                        }}
                                    >
                                        💗
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

export default WelcomeSequence;
