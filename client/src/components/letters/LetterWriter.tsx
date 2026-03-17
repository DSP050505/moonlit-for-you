import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';

interface Letter {
    id: number;
    sender: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

const LetterWriter: React.FC = () => {
    const [letters, setLetters] = useState<Letter[]>([
        {
            id: 1, sender: 'Devi Sri Prasad',
            content: 'My dearest Rishika,\n\nEvery night when I look at the moon, I know you\'re looking at the same one. That thought alone makes the distance feel smaller. You are my favorite chapter in this beautiful story called life.\n\nWith all my love,\nForever yours 💕',
            isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
    ]);
    const [isWriting, setIsWriting] = useState(false);
    const [newLetter, setNewLetter] = useState('');
    const [openLetterId, setOpenLetterId] = useState<number | null>(null);
    const [sealAnimation, setSealAnimation] = useState(false);

    const handleSend = () => {
        if (!newLetter.trim()) return;
        setSealAnimation(true);
        setTimeout(() => {
            setLetters(prev => [{
                id: Date.now(),
                sender: 'Devi Sri Prasad',
                content: newLetter,
                isRead: false,
                createdAt: new Date().toISOString(),
            }, ...prev]);
            setNewLetter('');
            setIsWriting(false);
            setSealAnimation(false);
        }, 1500);
    };

    const handleOpenLetter = (id: number) => {
        setOpenLetterId(id);
        setLetters(prev => prev.map(l => l.id === id ? { ...l, isRead: true } : l));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{
                maxWidth: '700px',
                margin: '0 auto',
                padding: 'var(--space-4)',
            }}
            className="letter-container"
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                }}>
                    💌 Letters to You
                </h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsWriting(true)}
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                        border: 'none',
                        color: 'var(--bg-primary)',
                        padding: '10px 22px',
                        borderRadius: 'var(--radius-pill)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                    }}
                >
                    ✍️ Write a Letter
                </motion.button>
            </div>

            {/* Writing Modal */}
            <AnimatePresence>
                {isWriting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                        onClick={() => setIsWriting(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '90%',
                                maxWidth: '500px',
                                maxHeight: '80vh',
                            }}
                        >
                            {/* Parchment Paper */}
                            <div style={{
                                background: 'linear-gradient(135deg, #f5e6c8, #ede0c8, #f0e4ce)',
                                borderRadius: 'var(--radius-card)',
                                padding: 'var(--space-8)',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                                position: 'relative',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                            }}>
                                <h3 style={{
                                    fontFamily: 'var(--font-handwriting)',
                                    color: '#5a4a3a',
                                    fontSize: '1.4rem',
                                    marginBottom: 'var(--space-4)',
                                    textAlign: 'center',
                                }}>
                                    My Dearest Rishika...
                                </h3>

                                <textarea
                                    value={newLetter}
                                    onChange={(e) => setNewLetter(e.target.value)}
                                    placeholder="Pour your heart out..."
                                    style={{
                                        width: '100%',
                                        minHeight: '250px',
                                        fontFamily: 'var(--font-handwriting)',
                                        fontSize: '1.1rem',
                                        color: '#3a2a1a',
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'vertical',
                                        lineHeight: 1.8,
                                    }}
                                />

                                {/* Seal Button */}
                                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.9 }}
                                        animate={sealAnimation ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
                                        onClick={handleSend}
                                        disabled={!newLetter.trim()}
                                        style={{
                                            background: '#c41a1a',
                                            border: 'none',
                                            color: 'white',
                                            padding: '14px 24px',
                                            borderRadius: '50%',
                                            width: '60px',
                                            height: '60px',
                                            cursor: newLetter.trim() ? 'pointer' : 'default',
                                            fontSize: '1.5rem',
                                            boxShadow: '0 4px 15px rgba(196, 26, 26, 0.4)',
                                            opacity: newLetter.trim() ? 1 : 0.5,
                                        }}
                                    >
                                        ❤️
                                    </motion.button>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#8a7a6a',
                                        marginTop: 'var(--space-2)',
                                        fontFamily: 'var(--font-handwriting)',
                                    }}>
                                        Seal with love
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Letter Envelopes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {letters.map((letter) => (
                    <motion.div
                        key={letter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                    >
                        <Card
                            glow={!letter.isRead}
                            onClick={() => handleOpenLetter(letter.id)}
                        >
                            <div style={{
                                padding: 'var(--space-4) var(--space-5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-4)',
                                cursor: 'pointer',
                            }}>
                                <motion.span
                                    animate={!letter.isRead ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '2rem' }}
                                >
                                    {letter.isRead ? '📭' : '💌'}
                                </motion.span>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontFamily: 'var(--font-heading)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        fontWeight: letter.isRead ? 400 : 600,
                                    }}>
                                        From {letter.sender}
                                    </p>
                                    <p style={{
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        marginTop: '2px',
                                    }}>
                                        {new Date(letter.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                {!letter.isRead && (
                                    <span style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: 'var(--accent-pink)',
                                        boxShadow: '0 0 8px var(--glow)',
                                    }} />
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Open Letter Modal */}
            <AnimatePresence>
                {openLetterId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenLetterId(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, rotateX: 90 }}
                            animate={{ scale: 1, rotateX: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(135deg, #f5e6c8, #ede0c8)',
                                borderRadius: 'var(--radius-card)',
                                padding: 'var(--space-8)',
                                maxWidth: '500px',
                                width: '90%',
                                maxHeight: '70vh',
                                overflowY: 'auto',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                            }}
                        >
                            <p style={{
                                fontFamily: 'var(--font-handwriting)',
                                fontSize: '1.1rem',
                                color: '#3a2a1a',
                                lineHeight: 2,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {letters.find(l => l.id === openLetterId)?.content}
                            </p>
                            <div style={{ textAlign: 'right', marginTop: 'var(--space-4)' }}>
                                <p style={{
                                    fontFamily: 'var(--font-handwriting)',
                                    color: '#8a6a4a',
                                    fontSize: '1rem',
                                    fontStyle: 'italic',
                                }}>
                                    With Love, {letters.find(l => l.id === openLetterId)?.sender} ❤️
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LetterWriter;
