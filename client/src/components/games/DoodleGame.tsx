import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/useSocket';

/* ─── Types ─── */
type Phase = 'idle' | 'drawing' | 'guessing' | 'revealed';

const COLORS = ['#ffffff', '#E8788A', '#F2A7C3', '#C4B1D4', '#F5D380', '#7ECFA0', '#81B1EE', '#ff6b6b'];
const SIZES = [3, 6, 12];

const DoodleGame: React.FC = () => {
    const { session } = useAuth();
    const { socket } = useSocket();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [phase, setPhase] = useState<Phase>('idle');
    const [word, setWord] = useState('');
    const [wordInput, setWordInput] = useState('');
    const [guessInput, setGuessInput] = useState('');
    const [guesses, setGuesses] = useState<{ guesser: string; guess: string; correct: boolean }[]>([]);
    const [brushColor, setBrushColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [revealedWord, setRevealedWord] = useState('');
    const [drawerName, setDrawerName] = useState('');

    const userRole = session?.user.role || 'unknown';

    /* ─── Canvas Drawing ─── */
    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const drawStroke = useCallback((points: { x: number; y: number }[], color: string, size: number) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || points.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }, []);

    const pointsBuffer = useRef<{ x: number; y: number }[]>([]);

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        if (phase !== 'drawing') return;
        e.preventDefault();
        setIsDrawing(true);
        const pos = getPos(e);
        pointsBuffer.current = [pos];
    };

    const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || phase !== 'drawing') return;
        e.preventDefault();
        const pos = getPos(e);
        pointsBuffer.current.push(pos);
        drawStroke([pointsBuffer.current[pointsBuffer.current.length - 2], pos], brushColor, brushSize);
    };

    const endDraw = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (pointsBuffer.current.length > 1 && socket) {
            socket.emit('doodle:stroke', {
                points: pointsBuffer.current,
                color: brushColor,
                size: brushSize,
            });
        }
        pointsBuffer.current = [];
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        if (socket) socket.emit('doodle:clear');
    };

    /* ─── Game Flow ─── */
    const startDrawing = () => {
        if (!wordInput.trim()) return;
        setWord(wordInput.trim().toLowerCase());
        setPhase('drawing');
        setGuesses([]);
        setRevealedWord('');
        clearCanvas();
        if (socket) {
            socket.emit('doodle:newRound', { drawer: userRole });
        }
    };

    const revealWord = () => {
        setPhase('revealed');
        setRevealedWord(word);
        if (socket) {
            socket.emit('doodle:reveal', { word, drawer: userRole });
        }
    };

    const submitGuess = () => {
        if (!guessInput.trim()) return;
        const guess = guessInput.trim();
        const correct = Boolean(
            guess.toLowerCase() === word.toLowerCase() ||
            (revealedWord && guess.toLowerCase() === revealedWord.toLowerCase())
        );

        setGuesses(prev => [...prev, { guesser: userRole, guess, correct }]);
        setGuessInput('');

        if (socket) {
            socket.emit('doodle:guess', { guesser: userRole, guess });
        }
    };

    const resetGame = () => {
        setPhase('idle');
        setWord('');
        setWordInput('');
        setGuesses([]);
        setRevealedWord('');
        clearCanvas();
    };

    /* ─── Socket Listeners ─── */
    useEffect(() => {
        if (!socket) return;

        const onStroke = (data: { points: { x: number; y: number }[]; color: string; size: number }) => {
            drawStroke(data.points, data.color, data.size);
        };

        const onClear = () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        };

        const onNewRound = (data: { drawer: string }) => {
            setDrawerName(data.drawer);
            setPhase('guessing');
            setGuesses([]);
            setRevealedWord('');
            setWord('');
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        };

        const onGuess = (data: { guesser: string; guess: string }) => {
            const correct = word ? data.guess.toLowerCase() === word.toLowerCase() : false;
            setGuesses(prev => [...prev, { guesser: data.guesser, guess: data.guess, correct }]);
        };

        const onReveal = (data: { word: string }) => {
            setRevealedWord(data.word);
            setPhase('revealed');
            // Re-check guesses against revealed word
            setGuesses(prev => prev.map(g => ({
                ...g,
                correct: g.guess.toLowerCase() === data.word.toLowerCase(),
            })));
        };

        socket.on('doodle:stroke', onStroke);
        socket.on('doodle:clear', onClear);
        socket.on('doodle:newRound', onNewRound);
        socket.on('doodle:guess', onGuess);
        socket.on('doodle:reveal', onReveal);

        return () => {
            socket.off('doodle:stroke', onStroke);
            socket.off('doodle:clear', onClear);
            socket.off('doodle:newRound', onNewRound);
            socket.off('doodle:guess', onGuess);
            socket.off('doodle:reveal', onReveal);
        };
    }, [socket, word, drawStroke]);

    /* ═════════ RENDER ═════════ */
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* ── IDLE: Enter word to draw ── */}
            <AnimatePresence mode="wait">
                {phase === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card hover3D={false}>
                            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                                <p style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🎨</p>
                                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                                    Doodle & Guess
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-5)' }}>
                                    Enter a word, draw it, and let your partner guess!
                                </p>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: '300px', margin: '0 auto' }}>
                                    <input
                                        type="text"
                                        value={wordInput}
                                        onChange={(e) => setWordInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && startDrawing()}
                                        placeholder="Enter a word to draw..."
                                        style={{
                                            flex: 1, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 'var(--radius-pill)', padding: '10px 16px',
                                            color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                                        }}
                                    />
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={startDrawing}
                                        style={{
                                            padding: '10px 18px', borderRadius: 'var(--radius-pill)',
                                            background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                            border: 'none', color: 'var(--bg-primary)', cursor: 'pointer',
                                            fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.85rem',
                                        }}>
                                        Draw! ✏️
                                    </motion.button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── DRAWING / GUESSING / REVEALED ── */}
            {phase !== 'idle' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Status Banner */}
                    <div style={{
                        textAlign: 'center', marginBottom: 'var(--space-3)',
                        padding: '8px', borderRadius: 'var(--radius-sm)',
                        background: phase === 'revealed' ? 'rgba(126, 207, 160, 0.15)' : 'rgba(242, 167, 195, 0.1)',
                    }}>
                        {phase === 'drawing' && (
                            <p style={{ color: 'var(--accent-pink)', fontSize: '0.85rem', margin: 0 }}>
                                ✏️ You're drawing: <strong>"{word}"</strong> — Don't let them see!
                            </p>
                        )}
                        {phase === 'guessing' && (
                            <p style={{ color: 'var(--accent-lavender)', fontSize: '0.85rem', margin: 0 }}>
                                🤔 {drawerName} is drawing... Guess the word!
                            </p>
                        )}
                        {phase === 'revealed' && (
                            <p style={{ color: '#7ECFA0', fontSize: '0.85rem', margin: 0 }}>
                                🎉 The word was: <strong>"{revealedWord}"</strong>
                            </p>
                        )}
                    </div>

                    {/* Canvas */}
                    <Card hover3D={false}>
                        <div style={{ padding: '8px' }}>
                            <canvas
                                ref={canvasRef}
                                width={600}
                                height={400}
                                onMouseDown={startDraw}
                                onMouseMove={moveDraw}
                                onMouseUp={endDraw}
                                onMouseLeave={endDraw}
                                onTouchStart={startDraw}
                                onTouchMove={moveDraw}
                                onTouchEnd={endDraw}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    aspectRatio: '3/2',
                                    borderRadius: '8px',
                                    background: 'rgba(0,0,0,0.3)',
                                    cursor: phase === 'drawing' ? 'crosshair' : 'default',
                                    touchAction: 'none',
                                }}
                            />
                        </div>
                    </Card>

                    {/* Drawing Tools (only for drawer) */}
                    {phase === 'drawing' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap',
                        }}>
                            {/* Colors */}
                            {COLORS.map(c => (
                                <motion.button key={c} whileTap={{ scale: 0.85 }}
                                    onClick={() => setBrushColor(c)}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: c, border: brushColor === c ? '3px solid var(--accent-pink)' : '2px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer', boxShadow: brushColor === c ? '0 0 8px var(--glow)' : 'none',
                                    }}
                                />
                            ))}
                            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
                            {/* Sizes */}
                            {SIZES.map(s => (
                                <motion.button key={s} whileTap={{ scale: 0.85 }}
                                    onClick={() => setBrushSize(s)}
                                    style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: brushSize === s ? 'var(--bg-surface)' : 'transparent',
                                        border: brushSize === s ? '2px solid var(--accent-pink)' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <div style={{ width: `${s + 2}px`, height: `${s + 2}px`, borderRadius: '50%', background: brushColor }} />
                                </motion.button>
                            ))}
                            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
                            <motion.button whileTap={{ scale: 0.85 }} onClick={clearCanvas}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                🗑️ Clear
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.85 }} onClick={revealWord}
                                style={{
                                    padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                                    background: 'rgba(126, 207, 160, 0.2)', border: '1px solid rgba(126, 207, 160, 0.3)',
                                    color: '#7ECFA0', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-heading)',
                                }}>
                                Reveal ✨
                            </motion.button>
                        </div>
                    )}

                    {/* Guessing Input (only for guesser) */}
                    {phase === 'guessing' && (
                        <div style={{
                            display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)',
                        }}>
                            <input
                                type="text"
                                value={guessInput}
                                onChange={(e) => setGuessInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                                placeholder="Type your guess..."
                                style={{
                                    flex: 1, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 'var(--radius-pill)', padding: '10px 16px',
                                    color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                                }}
                            />
                            <motion.button whileTap={{ scale: 0.9 }} onClick={submitGuess}
                                style={{
                                    padding: '10px 18px', borderRadius: 'var(--radius-pill)',
                                    background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                    border: 'none', color: 'var(--bg-primary)', cursor: 'pointer',
                                    fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.85rem',
                                }}>
                                Guess 🎯
                            </motion.button>
                        </div>
                    )}

                    {/* Guesses List */}
                    {guesses.length > 0 && (
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {guesses.map((g, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                    background: g.correct ? 'rgba(126, 207, 160, 0.1)' : 'transparent',
                                }}>
                                    <span style={{ fontSize: '0.8rem' }}>{g.correct ? '✅' : '❌'}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{g.guesser}:</span>
                                    <span style={{
                                        color: g.correct ? '#7ECFA0' : 'var(--text-primary)',
                                        fontSize: '0.85rem', fontWeight: g.correct ? 600 : 400,
                                    }}>
                                        {g.guess}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Round Button */}
                    {phase === 'revealed' && (
                        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={resetGame}
                                style={{
                                    padding: '10px 24px', borderRadius: 'var(--radius-pill)',
                                    background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                    border: 'none', color: 'var(--bg-primary)', cursor: 'pointer',
                                    fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.9rem',
                                }}>
                                New Round 🎨
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default DoodleGame;
