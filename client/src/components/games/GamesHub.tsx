import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';
import DoodleGame from './DoodleGame';

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
                            whileHover={{ scale: 1.05, rotateX: 10, rotateY: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={restart}
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                border: 'none', color: 'var(--bg-primary)',
                                padding: '12px 28px', borderRadius: 'var(--radius-pill)',
                                cursor: 'pointer', fontFamily: 'var(--font-heading)',
                                fontSize: '0.9rem', fontWeight: 500,
                                transformStyle: 'preserve-3d',
                                boxShadow: '0 10px 20px rgba(232, 120, 138, 0.4), inset 0 2px 5px rgba(255,255,255,0.4)'
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
                        <div style={{ padding: 'var(--space-6)', perspective: '1000px' }}>
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
            {/* 3D Glass Jar */}
            <motion.div
                whileHover={{ scale: 1.05, rotateZ: 2 }}
                whileTap={{ scale: 0.95, rotateZ: -2 }}
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
                    <div style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 10px var(--accent-pink))' }}>
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ fontSize: '3rem' }}
                        >
                            ✨
                        </motion.div>
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: [3, -3, 3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            style={{ fontSize: '1.5rem', position: 'absolute', bottom: -10, right: -15, opacity: 0.8 }}
                        >
                            💖
                        </motion.div>
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
                        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                        style={{ 
                            marginBottom: 'var(--space-6)',
                            perspective: '1500px',
                            transformStyle: 'preserve-3d',
                            position: 'relative',
                            zIndex: 10
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
                            {/* Tape mark on note */}
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
