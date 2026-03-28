import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { DoodleGame } from '../../../components/games/DoodleGame';
import { useMusic } from '../../../hooks/useMusic';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

type GameTab = 'quiz' | 'wishes' | 'doodle';

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    createdBy: string;
}

interface Wish {
    id: number;
    content: string;
    author: string;
    isRevealed: boolean;
}

export default function GamesScreen() {
    const [activeTab, setActiveTab] = useState<GameTab>('quiz');

    const tabs: { key: GameTab; label: string }[] = [
        { key: 'quiz', label: '❓ Quiz' },
        { key: 'wishes', label: '🫙 Wish Jar' },
        { key: 'doodle', label: '🎨 Doodle' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
            {/* Tab Switcher */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 8, paddingHorizontal: 16 }}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        style={{
                            paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
                            backgroundColor: activeTab === tab.key ? '#E8788A' : 'rgba(255,255,255,0.05)',
                        }}
                    >
                        <Text style={{ color: activeTab === tab.key ? 'white' : '#8A8FA8', fontWeight: '600', fontSize: 13 }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'quiz' && <LoveQuiz />}
            {activeTab === 'wishes' && <WishJar />}
            {activeTab === 'doodle' && <DoodleGame />}
        </View>
    );
}

/* ═══════════════════════════════════
   LOVE QUIZ
   ═══════════════════════════════════ */
function LoveQuiz() {
    const { session } = useAuth();
    const roomId = session?.room.id;
    const { currentTrack } = useMusic();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Create form state
    const [newQ, setNewQ] = useState('');
    const [newOptions, setNewOptions] = useState(['', '', '', '']);
    const [newCorrect, setNewCorrect] = useState(0);

    useEffect(() => { if (session) fetchQuestions(); }, [session]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/quiz?roomId=${roomId}`);
            const data = await res.json();
            if (data.questions) setQuestions(data.questions);
        } catch (err) { console.error('Quiz fetch error:', err); }
        finally { setIsLoading(false); }
    };

    const handleAnswer = (index: number) => {
        setSelectedAnswer(index);
        const q = questions[currentQ];
        if (index === q.correctIndex) setScore(prev => prev + 1);
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

    const handleCreateQuestion = async () => {
        if (!newQ || newOptions.some(opt => !opt) || !session) return;
        try {
            const res = await fetch(`${API_URL}/api/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, question: newQ, options: newOptions, correctIndex: newCorrect, createdBy: session.user.role }),
            });
            if (res.ok) {
                await fetchQuestions();
                setIsCreating(false);
                setNewQ('');
                setNewOptions(['', '', '', '']);
                setNewCorrect(0);
            }
        } catch (err) { console.error('Failed to create question:', err); }
    };

    const restart = () => { setCurrentQ(0); setScore(0); setSelectedAnswer(null); setShowResult(false); };

    if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#F2A7C3" /></View>;

    // CREATE FORM
    if (isCreating) {
        return (
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: currentTrack ? 120 : 0 }}>
                <View style={{ backgroundColor: '#141829', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Add New Question ❓</Text>
                    <TextInput value={newQ} onChangeText={setNewQ} placeholder="Enter your question..."
                        placeholderTextColor="#8A8FA8" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: 'white', marginBottom: 16, fontSize: 14 }} />
                    {newOptions.map((opt, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <TouchableOpacity onPress={() => setNewCorrect(i)}
                                style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: newCorrect === i ? '#F2A7C3' : 'rgba(255,255,255,0.2)', backgroundColor: newCorrect === i ? '#F2A7C3' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                                {newCorrect === i && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' }} />}
                            </TouchableOpacity>
                            <TextInput value={opt} onChangeText={(val) => { const next = [...newOptions]; next[i] = val; setNewOptions(next); }}
                                placeholder={`Option ${i + 1}`} placeholderTextColor="#8A8FA8"
                                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, color: 'white', fontSize: 14 }} />
                        </View>
                    ))}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                        <TouchableOpacity onPress={handleCreateQuestion}
                            style={{ flex: 1, backgroundColor: '#E8788A', padding: 14, borderRadius: 999, alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Question</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsCreating(false)}
                            style={{ padding: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24 }}>
                            <Text style={{ color: 'white' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    // EMPTY STATE
    if (questions.length === 0) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <Text style={{ color: '#8A8FA8', marginBottom: 20, fontSize: 16 }}>No questions yet! Be the first to add one.</Text>
                <TouchableOpacity onPress={() => setIsCreating(true)}
                    style={{ backgroundColor: '#E8788A', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Question ➕</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // RESULT SCREEN
    if (showResult) {
        const emoji = score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '⭐' : '💪';
        const msg = score >= questions.length * 0.8 ? '🎉 You know each other so well! True love!'
            : score >= questions.length * 0.5 ? '💕 Not bad! Keep learning about each other!'
            : 'Time to pay more attention! 😄';
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <View style={{ backgroundColor: '#141829', borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', width: '100%' }}>
                    <Text style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</Text>
                    <Text style={{ color: '#F5D380', fontSize: 48, fontWeight: 'bold', marginBottom: 8 }}>{score}/{questions.length}</Text>
                    <Text style={{ color: '#8A8FA8', textAlign: 'center', marginBottom: 24 }}>{msg}</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={restart} style={{ backgroundColor: '#E8788A', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Play Again 🔄</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsCreating(true)} style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999 }}>
                            <Text style={{ color: 'white' }}>Add ➕</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // QUIZ PLAY
    const question = questions[currentQ];
    return (
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: currentTrack ? 120 : 0 }}>
            {/* Progress Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flex: 1, flexDirection: 'row', gap: 3, marginRight: 12 }}>
                    {questions.map((_, i) => (
                        <View key={i} style={{ flex: 1, height: 3, backgroundColor: i <= currentQ ? '#F2A7C3' : 'rgba(255,255,255,0.05)', borderRadius: 999 }} />
                    ))}
                </View>
                <TouchableOpacity onPress={() => setIsCreating(true)} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 20 }}>➕</Text>
                </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#141829', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: '#8A8FA8', fontSize: 12, marginBottom: 4 }}>Question {currentQ + 1} of {questions.length}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginBottom: 16 }}>Added by {question.createdBy}</Text>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>{question.question}</Text>

                {question.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === question.correctIndex;
                    const showFeedback = selectedAnswer !== null;

                    let bgColor = 'rgba(255,255,255,0.04)';
                    let borderColor = 'rgba(255,255,255,0.1)';
                    if (showFeedback && isCorrect) { bgColor = 'rgba(126,207,160,0.15)'; borderColor = '#7ECFA0'; }
                    else if (showFeedback && isSelected && !isCorrect) { bgColor = 'rgba(232,120,138,0.15)'; borderColor = '#E8788A'; }

                    return (
                        <TouchableOpacity key={i} onPress={() => !showFeedback && handleAnswer(i)} disabled={showFeedback}
                            style={{ padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor, backgroundColor: bgColor, marginBottom: 12 }}>
                            <Text style={{ color: 'white', fontSize: 15 }}>{opt}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
}

/* ═══════════════════════════════════
   WISH JAR
   ═══════════════════════════════════ */
function WishJar() {
    const { session } = useAuth();
    const roomId = session?.room.id;
    const { currentTrack } = useMusic();
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [revealedWish, setRevealedWish] = useState<Wish | null>(null);
    const [newWish, setNewWish] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { if (session) fetchWishes(); }, [session]);

    const fetchWishes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/wishes?roomId=${roomId}`);
            const data = await res.json();
            if (data.wishes) setWishes(data.wishes);
        } catch (err) { console.error('Wishes fetch error:', err); }
        finally { setIsLoading(false); }
    };

    const revealRandom = async () => {
        const unrevealed = wishes.filter(w => !w.isRevealed);
        if (unrevealed.length === 0) return;
        const random = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        try {
            const res = await fetch(`${API_URL}/api/wishes/${random.id}/reveal`, { method: 'PATCH' });
            if (res.ok) {
                setRevealedWish(random);
                setWishes(prev => prev.map(w => w.id === random.id ? { ...w, isRevealed: true } : w));
            }
        } catch (err) { console.error('Failed to reveal wish:', err); }
    };

    const addWish = async () => {
        if (!newWish.trim() || !session) return;
        try {
            const res = await fetch(`${API_URL}/api/wishes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId,
                    content: newWish,
                    author: session.user.role === 'Rishika' ? 'Rishika' : 'Devi Sri Prasad',
                }),
            });
            if (res.ok) { await fetchWishes(); setNewWish(''); }
        } catch (err) { console.error('Failed to add wish:', err); }
    };

    const unrevealedCount = wishes.filter(w => !w.isRevealed).length;

    if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#F2A7C3" /></View>;

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, alignItems: 'center', paddingBottom: currentTrack ? 120 : 24 }}>
            {/* Jar */}
            <TouchableOpacity onPress={revealRandom} disabled={unrevealedCount === 0} activeOpacity={0.7}
                style={{ alignItems: 'center', marginBottom: 32 }}>
                <View style={{
                    width: 140, height: 180, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)',
                    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
                    opacity: unrevealedCount === 0 ? 0.5 : 1,
                }}>
                    <Text style={{ fontSize: 48 }}>{unrevealedCount > 0 ? '✨' : '🫙'}</Text>
                </View>
                <Text style={{ color: '#8A8FA8', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
                    {unrevealedCount > 0 ? `Tap the jar to reveal a wish (${unrevealedCount} left)` : 'Jar is empty! Add more ✨'}
                </Text>
            </TouchableOpacity>

            {/* Revealed Wish */}
            {revealedWish && (
                <TouchableOpacity onPress={() => setRevealedWish(null)} activeOpacity={0.9}
                    style={{ backgroundColor: '#f5e6c8', borderRadius: 24, padding: 24, marginBottom: 24, width: '100%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20 }}>
                    <Text style={{ fontFamily: 'Caveat', fontSize: 22, color: '#5a4a3a', marginBottom: 12, lineHeight: 30 }}>
                        "{revealedWish.content}"
                    </Text>
                    <Text style={{ fontSize: 13, color: '#8a6a4a', fontStyle: 'italic', textAlign: 'right', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 8 }}>
                        — {revealedWish.author}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Add Wish */}
            <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
                <TextInput value={newWish} onChangeText={setNewWish} placeholder="Write a wish or dream..."
                    placeholderTextColor="#8A8FA8" onSubmitEditing={addWish} returnKeyType="send" blurOnSubmit={false}
                    style={{ flex: 1, backgroundColor: '#1C2038', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12, color: 'white', fontSize: 14 }} />
                <TouchableOpacity onPress={addWish}
                    style={{ backgroundColor: '#E8788A', paddingHorizontal: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Add ✨</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

