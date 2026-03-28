import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';

interface Letter {
    id: number;
    roomId: number;
    sender: string;
    topFlap?: string;
    greeting?: string;
    content: string;
    closing?: string;
    isRead: boolean;
    createdAt: string;
}

const LetterWriter: React.FC = () => {
    const [letters, setLetters] = useState<Letter[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    
    // Form state
    const [topFlap, setTopFlap] = useState('To my one and only...');
    const [greeting, setGreeting] = useState('My Dearest Juliet,');
    const [content, setContent] = useState('');
    const [closing, setClosing] = useState('With all my love,');
    const [sender, setSender] = useState('Romeo');

    const [openLetterId, setOpenLetterId] = useState<number | null>(null);
    const [sealState, setSealState] = useState<'idle' | 'melting' | 'stamped'>('idle');

    useEffect(() => {
        fetch('/api/letters')
            .then(res => res.json())
            .then(data => {
                if (data.letters) setLetters(data.letters);
            })
            .catch(err => console.error(err));
    }, []);

    const playSealSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);

            setTimeout(() => {
                const thudOsc = ctx.createOscillator();
                const thudGain = ctx.createGain();
                thudOsc.type = 'sine';
                thudOsc.frequency.setValueAtTime(100, ctx.currentTime);
                thudOsc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);
                thudGain.gain.setValueAtTime(1, ctx.currentTime);
                thudGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                thudOsc.connect(thudGain);
                thudGain.connect(ctx.destination);
                thudOsc.start();
                thudOsc.stop(ctx.currentTime + 0.3);
            }, 600);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async () => {
        if (!content.trim() || !sender.trim()) return;
        setSealState('melting');
        playSealSound();

        setTimeout(() => setSealState('stamped'), 600);

        try {
            const res = await fetch('/api/letters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: 1,
                    sender,
                    topFlap,
                    greeting,
                    content,
                    closing
                })
            });
            const data = await res.json();
            
            setTimeout(() => {
                if (data.letter) {
                    setLetters(prev => [data.letter, ...prev]);
                }
                setContent('');
                setTopFlap('To my one and only...');
                setGreeting('My Dearest Juliet,');
                setClosing('With all my love,');
                setIsWriting(false);
                setSealState('idle');
            }, 1800);
        } catch (err) {
            console.error('Send error:', err);
            setTimeout(() => {
                setIsWriting(false);
                setSealState('idle');
            }, 1800);
        }
    };

    const handleOpenLetter = async (id: number) => {
        setOpenLetterId(id);
        const letter = letters.find(l => l.id === id);
        if (letter && !letter.isRead) {
            setLetters(prev => prev.map(l => l.id === id ? { ...l, isRead: true } : l));
            try {
                await fetch(`/api/letters/${id}/read`, { method: 'PATCH' });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const activeLetter = letters.find(l => l.id === openLetterId);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--space-4)' }}
            className="letter-container"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>💌 Letters to You</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsWriting(true)}
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                        border: 'none', color: 'var(--bg-primary)', padding: '10px 22px',
                        borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                        fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.9rem'
                    }}
                >
                    ✍️ Write a Letter
                </motion.button>
            </div>

            <AnimatePresence>
                {isWriting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', zIndex: 1000
                        }}
                        onClick={() => setIsWriting(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '90%', maxWidth: '550px', maxHeight: '85vh',
                                overflowY: 'auto'
                            }}
                        >
                            {/* Dark cinematic glassmorphism UI for writing the letter */}
                            <div style={{
                                background: 'rgba(15, 15, 25, 0.85)',
                                borderRadius: 'var(--radius-card)',
                                padding: 'var(--space-6)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                                color: 'var(--text-primary)',
                                display: 'flex', flexDirection: 'column', gap: 'var(--space-4)'
                            }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', color: 'var(--accent-pink)' }}>
                                    Compose Letter
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top Flap text</label>
                                    <input value={topFlap} onChange={e => setTopFlap(e.target.value)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Greeting</label>
                                    <input value={greeting} onChange={e => setGreeting(e.target.value)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Main Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Pour your heart out..."
                                        style={{
                                            width: '100%', minHeight: '180px',
                                            padding: '12px',
                                            borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white', outline: 'none', resize: 'vertical', lineHeight: 1.6
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Closing</label>
                                    <input value={closing} onChange={e => setClosing(e.target.value)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Name (Sender)</label>
                                    <input value={sender} onChange={e => setSender(e.target.value)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                                </div>

                                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', perspective: '800px' }}>
                                    <motion.button
                                        whileHover={sealState === 'idle' ? { scale: 1.05, rotateX: 10 } : {}}
                                        whileTap={sealState === 'idle' ? { scale: 0.95 } : {}}
                                        onClick={handleSend}
                                        disabled={!content.trim() || sealState !== 'idle'}
                                        initial={{ borderRadius: '50%' }}
                                        animate={{
                                            scale: sealState === 'melting' ? [1, 1.2, 1.4, 1.5] : sealState === 'stamped' ? 1.6 : 1,
                                            height: sealState === 'melting' ? ['60px', '40px', '30px', '20px'] : sealState === 'stamped' ? '25px' : '60px',
                                            width: sealState === 'melting' ? ['60px', '70px', '85px', '95px'] : sealState === 'stamped' ? '90px' : '60px',
                                            borderRadius: sealState === 'idle' ? '50%' : '40% 60% 70% 30% / 40% 50% 60% 50%',
                                            rotateZ: sealState === 'melting' ? [0, 5, -5, 2] : 0,
                                            boxShadow: sealState === 'idle' 
                                                ? '0 10px 20px rgba(180, 20, 20, 0.4), inset 0 5px 10px rgba(255,100,100,0.5)' 
                                                : sealState === 'melting'
                                                    ? '0 20px 40px rgba(180, 20, 20, 0.6), inset 0 2px 5px rgba(255,100,100,0.8)'
                                                    : '0 2px 5px rgba(150, 10, 10, 0.8), inset 0 -2px 5px rgba(0,0,0,0.4)',
                                            background: sealState === 'idle'
                                                ? 'radial-gradient(circle at 30% 30%, #ff4b4b, #c41a1a, #8a0b0b)'
                                                : 'radial-gradient(circle at 50% 50%, #e62e2e, #a31010)'
                                        }}
                                        transition={{ duration: sealState === 'melting' ? 0.6 : 0.2 }}
                                        style={{
                                            border: 'none', color: '#fff', margin: '0 auto', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', cursor: content.trim() && sealState === 'idle' ? 'pointer' : 'default',
                                            opacity: content.trim() ? 1 : 0.5, transformStyle: 'preserve-3d', position: 'relative'
                                        }}
                                    >
                                        <motion.span
                                            animate={{ 
                                                opacity: sealState === 'stamped' ? 1 : sealState === 'melting' ? 0 : 1,
                                                scale: sealState === 'stamped' ? 1 : 1.2,
                                                z: sealState === 'stamped' ? -5 : 10 
                                            }}
                                            style={{
                                                fontSize: sealState === 'stamped' ? '1.5rem' : '1.8rem',
                                                textShadow: sealState === 'stamped' ? 'inset 0 2px 4px rgba(0,0,0,0.8)' : '0 2px 4px rgba(0,0,0,0.5)',
                                                color: sealState === 'stamped' ? '#7a0a0a' : '#fff', transformStyle: 'preserve-3d'
                                            }}
                                        >
                                            {sealState === 'stamped' ? '❤️' : '💖'}
                                        </motion.span>
                                    </motion.button>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 'var(--space-4)', fontFamily: 'var(--font-handwriting)' }}>
                                        {sealState === 'idle' ? 'Tap wax to send' : sealState === 'melting' ? 'Sealing...' : 'Sent!'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {letters.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
                        No letters yet. Be the first to write one! 💌
                    </p>
                )}
                {letters.map((letter) => (
                    <motion.div
                        key={letter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                    >
                        <Card glow={!letter.isRead} onClick={() => handleOpenLetter(letter.id)}>
                            <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer' }}>
                                <motion.span animate={!letter.isRead ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '2rem' }}>
                                    {letter.isRead ? '📭' : '💌'}
                                </motion.span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: letter.isRead ? 400 : 600 }}>
                                        From {letter.sender}
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                                        {new Date(letter.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                {!letter.isRead && (
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-pink)', boxShadow: '0 0 8px var(--glow)' }} />
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {openLetterId && activeLetter && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenLetterId(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(5, 10, 20, 0.85)',
                            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', zIndex: 1000, perspective: '2000px',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotateY: -90, z: -500 }}
                            animate={{ scale: 1, rotateY: 0, z: 0 }}
                            exit={{ scale: 0.8, y: 100, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', transformStyle: 'preserve-3d' }}
                        >
                            <motion.div
                                initial={{ rotateX: -179 }}
                                animate={{ rotateX: 0 }}
                                transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
                                style={{
                                    background: 'linear-gradient(to bottom, #f5e6c8, #ebe0c8)',
                                    borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
                                    padding: 'var(--space-6)', transformOrigin: 'bottom',
                                    borderBottom: '1px dashed rgba(0,0,0,0.1)', boxShadow: '0 -10px 30px rgba(0,0,0,0.2)', backfaceVisibility: 'hidden',
                                }}
                            >
                                <p style={{ fontFamily: 'var(--font-handwriting)', color: '#8a6a4a', fontSize: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
                                    {activeLetter.topFlap || 'To my one and only...'}
                                </p>
                            </motion.div>

                            <div style={{ background: '#ebe0c8', padding: 'var(--space-6)', position: 'relative', zIndex: 2, boxShadow: '0 0 30px rgba(0,0,0,0.3)' }}>
                                {activeLetter.greeting && (
                                    <h3 style={{ fontFamily: 'var(--font-handwriting)', color: '#5a4a3a', fontSize: '1.4rem', marginBottom: 'var(--space-4)' }}>
                                        {activeLetter.greeting}
                                    </h3>
                                )}
                                <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.2rem', color: '#3a2a1a', lineHeight: 2, whiteSpace: 'pre-wrap' }}>
                                    {activeLetter.content}
                                </p>
                            </div>

                            <motion.div
                                initial={{ rotateX: 179 }}
                                animate={{ rotateX: 0 }}
                                transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
                                style={{
                                    background: 'linear-gradient(to top, #e3d6bc, #ebe0c8)',
                                    borderRadius: '0 0 var(--radius-card) var(--radius-card)',
                                    padding: 'var(--space-6)', transformOrigin: 'top',
                                    borderTop: '1px dashed rgba(0,0,0,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backfaceVisibility: 'hidden',
                                }}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontFamily: 'var(--font-handwriting)', color: '#8a6a4a', fontSize: '1.1rem', fontStyle: 'italic' }}>
                                        {activeLetter.closing || 'With all my love,'} <br/>
                                        <span style={{ fontSize: '1.3rem', color: '#c41a1a' }}>
                                            {activeLetter.sender}
                                        </span>
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LetterWriter;
