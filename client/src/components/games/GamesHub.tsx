import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';

interface Wish {
    id: number;
    content: string;
    author: string;
    isRevealed: boolean;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

const quizQuestions: QuizQuestion[] = [
    { question: "What's Rishika's favorite color?", options: ["Pink", "Lavender", "Blue", "Red"], correctIndex: 1 },
    { question: "What's our song?", options: ["Perfect", "A Thousand Years", "Can't Help Falling in Love", "All of Me"], correctIndex: 2 },
    { question: "Where did we first meet?", options: ["College", "Online", "Through friends", "At a café"], correctIndex: 0 },
    { question: "What's Rishika's favorite food?", options: ["Pizza", "Pasta", "Biryani", "Ice Cream"], correctIndex: 2 },
    { question: "What animal does Rishika love most?", options: ["Dogs", "Cats", "Rabbits", "Pandas"], correctIndex: 1 },
    { question: "What's my pet name for Rishika?", options: ["Baby", "Moon", "Love", "Star"], correctIndex: 1 },
    { question: "What movie did we watch on our first date?", options: ["Titanic", "The Notebook", "A Walk to Remember", "La La Land"], correctIndex: 3 },
    { question: "What's Rishika's dream travel destination?", options: ["Paris", "Tokyo", "Santorini", "Bali"], correctIndex: 0 },
    { question: "What time does Rishika usually sleep?", options: ["10 PM", "11 PM", "Midnight", "After midnight"], correctIndex: 2 },
    { question: "What's Rishika's zodiac sign?", options: ["Aries", "Libra", "Scorpio", "Leo"], correctIndex: 1 },
];

type GameTab = 'quiz' | 'wishes';

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
                {(['quiz', 'wishes'] as GameTab[]).map(tab => (
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
                        {tab === 'quiz' ? '❓ Love Quiz' : '🫙 Wish Jar'}
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'quiz' ? (
                    <LoveQuiz key="quiz" />
                ) : (
                    <WishJar key="wishes" />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* Love Quiz Component */
const LoveQuiz: React.FC = () => {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const question = quizQuestions[currentQ];

    const handleAnswer = (index: number) => {
        setSelectedAnswer(index);
        if (index === question.correctIndex) {
            setScore(prev => prev + 1);
        }
        setTimeout(() => {
            if (currentQ < quizQuestions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
                if (score + (index === question.correctIndex ? 1 : 0) >= 8) {
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
                            {score >= 8 ? '🏆' : score >= 5 ? '⭐' : '💪'}
                        </motion.div>
                        <h3 style={{
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--accent-gold)',
                            fontSize: '2rem',
                            marginBottom: 'var(--space-2)',
                        }}>
                            {score}/{quizQuestions.length}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                            {score >= 8 ? '🎉 You know Rishika so well! True love!' :
                                score >= 5 ? '💕 Not bad! Keep learning about each other!' :
                                    'Time to pay more attention! 😄'}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Progress */}
            <div style={{
                display: 'flex',
                gap: '3px',
                marginBottom: 'var(--space-4)',
            }}>
                {quizQuestions.map((_, i) => (
                    <div key={i} style={{
                        flex: 1, height: '3px',
                        background: i <= currentQ ? 'var(--accent-pink)' : 'var(--bg-surface)',
                        borderRadius: 'var(--radius-pill)',
                        transition: 'background 0.3s ease',
                    }} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                >
                    <Card hover3D={false}>
                        <div style={{ padding: 'var(--space-6)' }}>
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: 'var(--space-3)',
                            }}>
                                Question {currentQ + 1} of {quizQuestions.length}
                            </p>
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--text-primary)',
                                marginBottom: 'var(--space-6)',
                                fontSize: '1.15rem',
                            }}>
                                {question.question}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {question.options.map((opt, i) => {
                                    const isSelected = selectedAnswer === i;
                                    const isCorrect = i === question.correctIndex;
                                    const showFeedback = selectedAnswer !== null;

                                    return (
                                        <motion.button
                                            key={i}
                                            whileHover={!showFeedback ? { scale: 1.02 } : {}}
                                            whileTap={!showFeedback ? { scale: 0.98 } : {}}
                                            onClick={() => !showFeedback && handleAnswer(i)}
                                            style={{
                                                padding: '14px 20px',
                                                borderRadius: 'var(--radius-card)',
                                                border: showFeedback && isCorrect
                                                    ? '1px solid var(--success)'
                                                    : showFeedback && isSelected && !isCorrect
                                                        ? '1px solid var(--accent-rose)'
                                                        : '1px solid rgba(255,255,255,0.08)',
                                                background: showFeedback && isCorrect
                                                    ? 'rgba(126, 207, 160, 0.15)'
                                                    : showFeedback && isSelected && !isCorrect
                                                        ? 'rgba(232, 120, 138, 0.15)'
                                                        : 'var(--bg-surface)',
                                                color: 'var(--text-primary)',
                                                cursor: showFeedback ? 'default' : 'pointer',
                                                textAlign: 'left',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
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
    const [wishes, setWishes] = useState<Wish[]>([
        { id: 1, content: 'I wish we could watch the sunset together 🌅', author: 'Devi Sri Prasad', isRevealed: false },
        { id: 2, content: 'I wish to cook dinner for you someday 🍝', author: 'Rishika', isRevealed: false },
        { id: 3, content: 'I wish we could travel to Paris together 🗼', author: 'Devi Sri Prasad', isRevealed: false },
        { id: 4, content: 'I wish to fall asleep on a video call together 🌙', author: 'Rishika', isRevealed: false },
    ]);
    const [revealedWish, setRevealedWish] = useState<Wish | null>(null);
    const [newWish, setNewWish] = useState('');

    const revealRandom = () => {
        const unrevealed = wishes.filter(w => !w.isRevealed);
        if (unrevealed.length === 0) return;
        const random = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setRevealedWish(random);
        setWishes(prev => prev.map(w => w.id === random.id ? { ...w, isRevealed: true } : w));
    };

    const addWish = () => {
        if (!newWish.trim()) return;
        setWishes(prev => [...prev, {
            id: Date.now(),
            content: newWish,
            author: 'Devi Sri Prasad',
            isRevealed: false,
        }]);
        setNewWish('');
    };

    const unrevealedCount = wishes.filter(w => !w.isRevealed).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}
        >
            {/* Jar */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={revealRandom}
                style={{
                    display: 'inline-block',
                    cursor: unrevealedCount > 0 ? 'pointer' : 'default',
                    marginBottom: 'var(--space-6)',
                }}
            >
                <Card glow hover3D={false}>
                    <div style={{ padding: 'var(--space-8) var(--space-12)' }}>
                        <motion.div
                            animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            style={{ fontSize: '5rem' }}
                        >
                            🫙
                        </motion.div>
                        <p style={{
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            marginTop: 'var(--space-3)',
                        }}>
                            {unrevealedCount > 0
                                ? `Tap to reveal a wish (${unrevealedCount} left)`
                                : 'All wishes revealed! Add more ✨'}
                        </p>
                    </div>
                </Card>
            </motion.div>

            {/* Revealed Wish */}
            <AnimatePresence>
                {revealedWish && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, rotate: -5, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        style={{ marginBottom: 'var(--space-6)' }}
                    >
                        <Card glow hover3D={false}>
                            <div style={{
                                padding: 'var(--space-6)',
                                background: 'rgba(242, 167, 195, 0.05)',
                            }}>
                                <p style={{
                                    fontFamily: 'var(--font-handwriting)',
                                    fontSize: '1.2rem',
                                    color: 'var(--text-primary)',
                                    marginBottom: 'var(--space-2)',
                                }}>
                                    "{revealedWish.content}"
                                </p>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                }}>
                                    — {revealedWish.author}
                                </p>
                            </div>
                        </Card>
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
