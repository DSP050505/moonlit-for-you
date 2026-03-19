import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';
import DoodleGame from './DoodleGame';
import { useAuth } from '../../context/AuthContext';

interface Wish {
    id: number;
    content: string;
    author: string;
    isRevealed: boolean;
}

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    createdBy: string;
}

type GameTab = 'quiz' | 'wishes' | 'doodle';

const GamesHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<GameTab>('quiz');

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
            className="games-container"
        >
            <h2 style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
                textAlign: 'center',
            }}>
                🎮 Play Together
            </h2>

            {/* Tab Switcher */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-6)',
            }}>
                {(['quiz', 'wishes', 'doodle'] as GameTab[]).map(tab => (
                    <motion.button
                        key={tab}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: 'var(--radius-pill)',
                            border: 'none',
                            background: activeTab === tab
                                ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))'
                                : 'var(--bg-surface)',
                            color: activeTab === tab ? 'var(--bg-primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                        }}
                    >
                        {tab === 'quiz' ? '❓ Quiz' : tab === 'wishes' ? '🫙 Wish Jar' : '🎨 Doodle'}
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'quiz' ? (
                    <LoveQuiz key="quiz" />
                ) : activeTab === 'wishes' ? (
                    <WishJar key="wishes" />
                ) : (
                    <DoodleGame key="doodle" />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* Love Quiz Component */
const LoveQuiz: React.FC = () => {
    const { session } = useAuth();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // New Question Form State
    const [newQ, setNewQ] = useState('');
    const [newOptions, setNewOptions] = useState(['', '', '', '']);
    const [newCorrect, setNewCorrect] = useState(0);

    useEffect(() => {
        if (!session) return;
        fetchQuestions();
    }, [session]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/quiz?roomId=${session?.room.id}`);
            const data = await res.json();
            if (data.questions) {
                setQuestions(data.questions);
            }
        } catch (err) {
            console.error('Failed to fetch quiz questions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateQuestion = async () => {
        if (!newQ || newOptions.some(opt => !opt) || !session) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: session.room.id,
                    question: newQ,
                    options: newOptions,
                    correctIndex: newCorrect,
                    createdBy: session.user.role
                }),
            });

            if (res.ok) {
                await fetchQuestions();
                setIsCreating(false);
                setNewQ('');
                setNewOptions(['', '', '', '']);
                setNewCorrect(0);
            }
        } catch (err) {
            console.error('Failed to create question:', err);
        }
    };

    const handleAnswer = (index: number) => {
        setSelectedAnswer(index);
        const q = questions[currentQ];
        if (index === q.correctIndex) {
            setScore(prev => prev + 1);
        }
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
                if (score + (index === q.correctIndex ? 1 : 0) >= questions.length * 0.7) {
                    import('../shared/ConfettiTrigger').then(({ fireConfetti }) => {
                        fireConfetti('stars');
                    });
                }
            }
        }, 1000);
    };

    const restart = () => {
        setCurrentQ(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    if (isLoading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading questions...</div>;

    if (isCreating) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card glow>
                    <div style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                            Add New Question ❓
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <input
                                placeholder="Enter your question..."
                                value={newQ}
                                onChange={(e) => setNewQ(e.target.value)}
                                style={{
                                    padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)', color: 'white'
                                }}
                            />
                            {newOptions.map((opt, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={newCorrect === i}
                                        onChange={() => setNewCorrect(i)}
                                    />
                                    <input
                                        placeholder={`Option ${i + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const next = [...newOptions];
                                            next[i] = e.target.value;
                                            setNewOptions(next);
                                        }}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.2)', color: 'white'
                                        }}
                                    />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={handleCreateQuestion}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 'var(--radius-pill)',
                                        border: 'none', background: 'var(--accent-pink)', color: 'white', cursor: 'pointer'
                                    }}
                                >
                                    Save Question
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setIsCreating(false)}
                                    style={{
                                        padding: '12px', borderRadius: 'var(--radius-pill)',
                                        border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                                        color: 'white', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
    }

    if (questions.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>No questions yet! Be the first to add one.</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsCreating(true)}
                    style={{
                        padding: '12px 24px', borderRadius: 'var(--radius-pill)',
                        border: 'none', background: 'var(--accent-rose)', color: 'white', cursor: 'pointer'
                    }}
                >
                    Add Question ➕
                </motion.button>
            </div>
        );
    }

    if (showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center' }}
            >
                <Card glow hover3D={false}>
                    <div style={{ padding: 'var(--space-8)' }}>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}
                        >
                            {score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '⭐' : '💪'}
                        </motion.div>
                        <h3 style={{
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--accent-gold)',
                            fontSize: '2rem',
                            marginBottom: 'var(--space-2)',
                        }}>
                            {score}/{questions.length}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                            {score >= questions.length * 0.8 ? '🎉 You know each other so well! True love!' :
                                score >= questions.length * 0.5 ? '💕 Not bad! Keep learning about each other!' :
                                    'Time to pay more attention! 😄'}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={restart}
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                    border: 'none', color: 'var(--bg-primary)',
                                    padding: '12px 28px', borderRadius: 'var(--radius-pill)',
                                    cursor: 'pointer', fontFamily: 'var(--font-heading)',
                                    fontSize: '0.9rem', fontWeight: 500,
                                }}
                            >
                                Play Again 🔄
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setIsCreating(true)}
                                style={{
                                    border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                                    padding: '12px 28px', borderRadius: 'var(--radius-pill)',
                                    cursor: 'pointer', background: 'transparent',
                                }}
                            >
                                Add Question ➕
                            </motion.button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
    }

    const question = questions[currentQ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: '3px', flex: 1, marginRight: '15px' }}>
                    {questions.map((_, i) => (
                        <div key={i} style={{
                            flex: 1, height: '3px',
                            background: i <= currentQ ? 'var(--accent-pink)' : 'var(--bg-surface)',
                            borderRadius: 'var(--radius-pill)',
                            transition: 'background 0.3s ease',
                        }} />
                    ))}
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setIsCreating(true)}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                    title="Add Question"
                >
                    ➕
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                >
                    <Card hover3D={false}>
                        <div style={{ padding: 'var(--space-6)', perspective: '1000px' }}>
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: 'var(--space-1)',
                            }}>
                                Question {currentQ + 1} of {questions.length}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: 'var(--space-3)' }}>
                                Added by {question.createdBy}
                            </p>
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--text-primary)',
                                marginBottom: 'var(--space-6)',
                                fontSize: '1.15rem',
                            }}>
                                {question.question}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', transformStyle: 'preserve-3d' }}>
                                {question.options.map((opt, i) => {
                                    const isSelected = selectedAnswer === i;
                                    const isCorrect = i === question.correctIndex;
                                    const showFeedback = selectedAnswer !== null;

                                    return (
                                        <motion.button
                                            key={i}
                                            whileHover={!showFeedback ? { scale: 1.02, rotateX: 5, rotateY: -3, z: 20 } : {}}
                                            whileTap={!showFeedback ? { scale: 0.98, z: -10 } : {}}
                                            onClick={() => !showFeedback && handleAnswer(i)}
                                            style={{
                                                padding: '16px 24px',
                                                borderRadius: 'var(--radius-lg)',
                                                border: showFeedback && isCorrect
                                                    ? '2px solid var(--success)'
                                                    : showFeedback && isSelected && !isCorrect
                                                        ? '2px solid var(--accent-rose)'
                                                        : '1px solid rgba(255,255,255,0.15)',
                                                background: showFeedback && isCorrect
                                                    ? 'linear-gradient(145deg, rgba(126, 207, 160, 0.3), rgba(126, 207, 160, 0.1))'
                                                    : showFeedback && isSelected && !isCorrect
                                                        ? 'linear-gradient(145deg, rgba(232, 120, 138, 0.3), rgba(232, 120, 138, 0.1))'
                                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                                                color: 'var(--text-primary)',
                                                cursor: showFeedback ? 'default' : 'pointer',
                                                textAlign: 'left',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '0.95rem',
                                                transition: 'all 0.3s ease',
                                                transformStyle: 'preserve-3d',
                                                boxShadow: showFeedback && isCorrect
                                                    ? '0 10px 30px rgba(126, 207, 160, 0.3), inset 0 2px 10px rgba(126, 207, 160, 0.5)'
                                                    : showFeedback && isSelected && !isCorrect
                                                        ? '0 10px 30px rgba(232, 120, 138, 0.3), inset 0 2px 10px rgba(232, 120, 138, 0.5)'
                                                        : '0 8px 16px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            {/* Glowing frame dot on correctly answered */}
                                            {showFeedback && isCorrect && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0 }} 
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: 'spring' }}
                                                    style={{
                                                        position: 'absolute', right: 20, top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '12px', height: '12px',
                                                        borderRadius: '50%', background: 'var(--success)',
                                                        boxShadow: '0 0 10px var(--success), 0 0 20px var(--success)'
                                                    }}
                                                />
                                            )}
                                            {opt}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

/* Wish Jar Component */
const WishJar: React.FC = () => {
    const { session } = useAuth();
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [revealedWish, setRevealedWish] = useState<Wish | null>(null);
    const [newWish, setNewWish] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session) return;
        fetchWishes();
    }, [session]);

    const fetchWishes = async () => {
        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/wishes?roomId=${session?.room.id}`);
            const data = await res.json();
            if (data.wishes) {
                setWishes(data.wishes);
            }
        } catch (err) {
            console.error('Failed to fetch wishes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const revealRandom = async () => {
        const unrevealed = wishes.filter(w => !w.isRevealed);
        if (unrevealed.length === 0) return;
        const random = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/wishes/${random.id}/reveal`, {
                method: 'PATCH',
            });
            if (res.ok) {
                setRevealedWish(random);
                setWishes(prev => prev.map(w => w.id === random.id ? { ...w, isRevealed: true } : w));
            }
        } catch (err) {
            console.error('Failed to reveal wish:', err);
        }
    };

    const addWish = async () => {
        if (!newWish.trim() || !session) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/wishes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: session.room.id,
                    content: newWish,
                    author: session.user.role === 'Rishika' ? 'Rishika' : 'Devi Sri Prasad',
                }),
            });

            if (res.ok) {
                await fetchWishes();
                setNewWish('');
            }
        } catch (err) {
            console.error('Failed to add wish:', err);
        }
    };

    const unrevealedCount = wishes.filter(w => !w.isRevealed).length;

    if (isLoading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading wishes...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}
        >
            {/* 3D Glass Jar */}
            <motion.div
                whileHover={unrevealedCount > 0 ? { scale: 1.05, rotateZ: 2 } : {}}
                whileTap={unrevealedCount > 0 ? { scale: 0.95, rotateZ: -2 } : {}}
                onClick={revealRandom}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: unrevealedCount > 0 ? 'pointer' : 'default',
                    marginBottom: 'var(--space-6)',
                    perspective: '1000px'
                }}
            >
                <div style={{
                    width: '140px',
                    height: '180px',
                    borderRadius: '40% 40% 45% 45% / 20% 20% 10% 10%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 20px 40px rgba(255,255,255,0.1), inset 0 -20px 40px rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    opacity: unrevealedCount === 0 ? 0.6 : 1,
                }}>
                    {/* Jar Lid */}
                    <div style={{
                        position: 'absolute',
                        top: '-15px',
                        width: '80px',
                        height: '25px',
                        background: 'linear-gradient(to right, #c18b5b, #e0a96d, #8f5c35)',
                        borderRadius: '4px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.3)',
                        border: '1px solid #734825',
                        zIndex: 2,
                    }} />

                    {/* Glowing Stars inside */}
                    <div style={{ position: 'relative', zIndex: 1, filter: unrevealedCount > 0 ? 'drop-shadow(0 0 10px var(--accent-pink))' : 'none' }}>
                        <motion.div
                            initial={{ y: 0 }}
                            animate={unrevealedCount > 0 ? { y: [-5, 5, -5] } : {}}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ fontSize: '3rem', opacity: unrevealedCount > 0 ? 1 : 0.3 }}
                        >
                            {unrevealedCount > 0 ? '✨' : '🫙'}
                        </motion.div>
                        {unrevealedCount > 0 && (
                            <motion.div
                                initial={{ y: 0 }}
                                animate={{ y: [3, -3, 3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                style={{ fontSize: '1.5rem', position: 'absolute', bottom: -10, right: -15, opacity: 0.8 }}
                            >
                                💖
                            </motion.div>
                        )}
                    </div>

                    {/* Jar Reflection line */}
                    <div style={{
                        position: 'absolute',
                        left: '15%',
                        top: '15%',
                        bottom: '15%',
                        width: '8%',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
                        borderRadius: '50%',
                        filter: 'blur(2px)',
                        transform: 'rotate(-5deg)'
                    }} />
                </div>
                <p style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    marginTop: 'var(--space-4)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    {unrevealedCount > 0
                        ? `Tap the jar to reveal a wish (${unrevealedCount} left)`
                        : 'Jar is empty! Add more ✨'}
                </p>
            </motion.div>

            {/* Revealed Wish (3D Flip Out) */}
            <AnimatePresence>
                {revealedWish && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, rotateX: 90, scale: 0.5, z: -200 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, z: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateX: -90, y: 50, z: -100 }}
                        onClick={() => setRevealedWish(null)}
                        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                        style={{ 
                            marginBottom: 'var(--space-6)',
                            perspective: '1500px',
                            transformStyle: 'preserve-3d',
                            position: 'relative',
                            zIndex: 10,
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            padding: 'var(--space-6)',
                            background: 'linear-gradient(135deg, #f5e6c8, #ede0c8)',
                            borderRadius: 'var(--radius-card)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.2)',
                            transformStyle: 'preserve-3d',
                            position: 'relative',
                        }}>
                             <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%) rotate(-3deg)',
                                width: '40px',
                                height: '20px',
                                background: 'rgba(255,255,255,0.5)',
                                backdropFilter: 'blur(2px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />

                            <p style={{
                                fontFamily: 'var(--font-handwriting)',
                                fontSize: '1.4rem',
                                color: '#5a4a3a',
                                marginBottom: 'var(--space-3)',
                                lineHeight: 1.6,
                                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                            }}>
                                "{revealedWish.content}"
                            </p>
                            <p style={{
                                fontSize: '0.85rem',
                                color: '#8a6a4a',
                                fontStyle: 'italic',
                                textAlign: 'right',
                                borderTop: '1px dashed rgba(0,0,0,0.1)',
                                paddingTop: 'var(--space-2)'
                            }}>
                                — {revealedWish.author}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add New Wish */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-2)',
                maxWidth: '500px',
                margin: '0 auto',
            }}>
                <input
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addWish()}
                    placeholder="Write a wish or dream..."
                    style={{
                        flex: 1,
                        background: 'var(--bg-surface)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '10px 18px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addWish}
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                        border: 'none',
                        color: 'var(--bg-primary)',
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-pill)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.85rem',
                    }}
                >
                    Add ✨
                </motion.button>
            </div>
        </motion.div>
    );
};

export default GamesHub;
