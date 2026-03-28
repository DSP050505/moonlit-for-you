import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions, PanResponder, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { Send, Eraser, Eye, RefreshCw } from 'lucide-react-native';

type Phase = 'idle' | 'drawing' | 'guessing' | 'revealed';

const COLORS = ['#ffffff', '#E8788A', '#F2A7C3', '#C4B1D4', '#F5D380', '#7ECFA0', '#81B1EE', '#ff6b6b'];
const SIZES = [3, 6, 12];

interface Point { x: number; y: number }
interface Stroke {
    points: Point[];
    color: string;
    size: number;
}
interface Guess {
    guesser: string;
    guess: string;
    correct: boolean;
}

export function DoodleGame() {
    const { session } = useAuth();
    const { socket } = useSocket();
    
    const [phase, setPhase] = useState<Phase>('idle');
    const [word, setWord] = useState('');
    const [wordInput, setWordInput] = useState('');
    const [guessInput, setGuessInput] = useState('');
    const [guesses, setGuesses] = useState<Guess[]>([]);
    
    // Drawing states
    const [brushColor, setBrushColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const currentPointsRef = useRef<Point[]>([]);

    const [revealedWord, setRevealedWord] = useState('');
    const [drawerName, setDrawerName] = useState('');

    const userRole = session?.user.role || 'unknown';

    // SVG path string generator
    const generatePath = (points: Point[]) => {
        if (!points || points.length === 0) return '';
        const d = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        return d;
    };

    // PanResponder for drawing
    const panResponderRef = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => phase === 'drawing',
            onMoveShouldSetPanResponder: () => phase === 'drawing',
            onPanResponderGrant: (evt) => {
                if (phase !== 'drawing') return;
                const { locationX, locationY } = evt.nativeEvent;
                currentPointsRef.current = [{ x: locationX, y: locationY }];
                setCurrentStroke({ points: [{ x: locationX, y: locationY }], color: brushColor, size: brushSize });
            },
            onPanResponderMove: (evt) => {
                if (phase !== 'drawing') return;
                const { locationX, locationY } = evt.nativeEvent;
                currentPointsRef.current.push({ x: locationX, y: locationY });
                // We use structuredClone or just slice to trigger re-render
                setCurrentStroke({ 
                    points: [...currentPointsRef.current], 
                    color: brushColor, 
                    size: brushSize 
                });
            },
            onPanResponderRelease: () => {
                if (phase !== 'drawing') return;
                if (currentPointsRef.current.length > 1) {
                    const finalStroke = {
                        points: [...currentPointsRef.current],
                        color: brushColor,
                        size: brushSize
                    };
                    setStrokes(prev => [...prev, finalStroke]);
                    if (socket) {
                        socket.emit('doodle:stroke', finalStroke);
                    }
                }
                setCurrentStroke(null);
                currentPointsRef.current = [];
            }
        })
    );

    // Keep the refs updated with the latest brush settings
    useEffect(() => {
        panResponderRef.current = PanResponder.create({
            onStartShouldSetPanResponder: () => phase === 'drawing',
            onMoveShouldSetPanResponder: () => phase === 'drawing',
            onPanResponderGrant: (evt) => {
                if (phase !== 'drawing') return;
                const { locationX, locationY } = evt.nativeEvent;
                currentPointsRef.current = [{ x: locationX, y: locationY }];
                setCurrentStroke({ points: [{ x: locationX, y: locationY }], color: brushColor, size: brushSize });
            },
            onPanResponderMove: (evt) => {
                if (phase !== 'drawing') return;
                const { locationX, locationY } = evt.nativeEvent;
                currentPointsRef.current.push({ x: locationX, y: locationY });
                setCurrentStroke({ 
                    points: [...currentPointsRef.current], 
                    color: brushColor, 
                    size: brushSize 
                });
            },
            onPanResponderRelease: () => {
                if (phase !== 'drawing') return;
                if (currentPointsRef.current.length > 1) {
                    const finalStroke = {
                        points: [...currentPointsRef.current],
                        color: brushColor,
                        size: brushSize
                    };
                    setStrokes(prev => [...prev, finalStroke]);
                    if (socket) {
                        socket.emit('doodle:stroke', finalStroke);
                    }
                }
                setCurrentStroke(null);
                currentPointsRef.current = [];
            }
        });
    }, [brushColor, brushSize, phase, socket]);


    const startDrawing = () => {
        if (!wordInput.trim()) return;
        Keyboard.dismiss();
        setWord(wordInput.trim().toLowerCase());
        setPhase('drawing');
        setGuesses([]);
        setRevealedWord('');
        setStrokes([]);
        if (socket) {
            socket.emit('doodle:newRound', { drawer: userRole });
        }
    };

    const clearCanvas = () => {
        setStrokes([]);
        if (socket) socket.emit('doodle:clear');
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
        setStrokes([]);
    };

    /* ─── Socket Listeners ─── */
    useEffect(() => {
        if (!socket) return;

        const onStroke = (data: Stroke) => {
            setStrokes(prev => [...prev, data]);
        };

        const onClear = () => {
            setStrokes([]);
        };

        const onNewRound = (data: { drawer: string }) => {
            setDrawerName(data.drawer);
            setPhase('guessing');
            setGuesses([]);
            setRevealedWord('');
            setWord('');
            setStrokes([]);
        };

        const onGuess = (data: { guesser: string; guess: string }) => {
            // Need to determine local correctness if we know the word
            // Note: If we are receiver, `word` is empty until revealed, so `correct` relies on our knowledge 
            // Wait, Web does: const correct = word ? ... : false
            const correct = word ? data.guess.toLowerCase() === word.toLowerCase() : false;
            setGuesses(prev => [...prev, { guesser: data.guesser, guess: data.guess, correct }]);
        };

        const onReveal = (data: { word: string }) => {
            setRevealedWord(data.word);
            setPhase('revealed');
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
    }, [socket, word]);

    return (
        <View style={{ flex: 1, padding: 20 }}>
            {/* ── IDLE: Enter word to draw ── */}
            {phase === 'idle' && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 50, marginBottom: 16 }}>🎨</Text>
                    <Text style={{ fontFamily: 'Quicksand', color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
                        Doodle & Guess
                    </Text>
                    <Text style={{ color: '#8A8FA8', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
                        Enter a word, draw it, and let your partner guess!
                    </Text>
                    
                    <View style={{ width: '100%', maxWidth: 320, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <TextInput
                            style={{ flex: 1, color: 'white', paddingHorizontal: 16, height: 44, fontSize: 16 }}
                            placeholder="Enter a secret word..."
                            placeholderTextColor="#8A8FA8"
                            value={wordInput}
                            onChangeText={setWordInput}
                            onSubmitEditing={startDrawing}
                        />
                        <TouchableOpacity 
                            onPress={startDrawing}
                            style={{ backgroundColor: '#E8788A', paddingHorizontal: 20, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Draw! ✏️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ── DRAWING / GUESSING / REVEALED ── */}
            {phase !== 'idle' && (
                <View style={{ flex: 1 }}>
                    {/* Status Banner */}
                    <View style={{
                        padding: 12, borderRadius: 12, marginBottom: 16, alignItems: 'center',
                        backgroundColor: phase === 'revealed' ? 'rgba(126, 207, 160, 0.15)' : 'rgba(242, 167, 195, 0.1)',
                    }}>
                        {phase === 'drawing' && (
                            <Text style={{ color: '#E8788A', fontSize: 14, fontWeight: 'bold' }}>
                                ✏️ You're drawing: <Text style={{ color: 'white' }}>"{word}"</Text>
                            </Text>
                        )}
                        {phase === 'guessing' && (
                            <Text style={{ color: '#C4B1D4', fontSize: 14, fontWeight: 'bold' }}>
                                🤔 {drawerName} is drawing... Guess the word!
                            </Text>
                        )}
                        {phase === 'revealed' && (
                            <Text style={{ color: '#7ECFA0', fontSize: 14, fontWeight: 'bold' }}>
                                🎉 The word was: <Text style={{ color: 'white' }}>"{revealedWord}"</Text>
                            </Text>
                        )}
                    </View>

                    {/* Canvas Area */}
                    <View
                        style={{
                            width: '100%',
                            aspectRatio: 1,
                            backgroundColor: 'rgba(10, 10, 15, 0.95)',
                            borderRadius: 16,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.1)',
                            marginBottom: 20
                        }}
                        {...(phase === 'drawing' ? panResponderRef.current.panHandlers : {})}
                    >
                        <Svg style={{ flex: 1 }}>
                            {/* Render confirmed strokes */}
                            {strokes.map((stroke, index) => (
                                <Path
                                    key={`stroke-${index}`}
                                    d={generatePath(stroke.points)}
                                    stroke={stroke.color}
                                    strokeWidth={stroke.size}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            ))}
                            {/* Render current active stroke */}
                            {currentStroke && currentStroke.points.length > 0 && (
                                <Path
                                    d={generatePath(currentStroke.points)}
                                    stroke={currentStroke.color}
                                    strokeWidth={currentStroke.size}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            )}
                        </Svg>
                    </View>

                    {/* Drawer Tools */}
                    {phase === 'drawing' && (
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                                {COLORS.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => setBrushColor(c)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 16, backgroundColor: c,
                                            borderWidth: brushColor === c ? 3 : 1,
                                            borderColor: brushColor === c ? '#E8788A' : 'rgba(255,255,255,0.3)',
                                        }}
                                    />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    {SIZES.map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => setBrushSize(s)}
                                            style={{
                                                width: 36, height: 36, borderRadius: 18,
                                                borderWidth: brushSize === s ? 2 : 1,
                                                borderColor: brushSize === s ? '#E8788A' : 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center', alignItems: 'center'
                                            }}
                                        >
                                            <View style={{ width: s + 2, height: s + 2, borderRadius: (s + 2)/2, backgroundColor: brushColor }} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                <TouchableOpacity onPress={clearCanvas} style={{ padding: 8 }}>
                                    <Eraser color="#8A8FA8" size={24} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={revealWord} style={{ padding: 8 }}>
                                    <Eye color="#7ECFA0" size={24} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Guesser Input */}
                    {phase === 'guessing' && (
                        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 12 }}>
                            <TextInput
                                style={{ flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, color: 'white' }}
                                placeholder="Type your guess..."
                                placeholderTextColor="#8A8FA8"
                                value={guessInput}
                                onChangeText={setGuessInput}
                                onSubmitEditing={submitGuess}
                            />
                            <TouchableOpacity
                                onPress={submitGuess}
                                style={{ width: 48, height: 48, backgroundColor: '#E8788A', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Send color="white" size={20} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Guesses List */}
                    {guesses.length > 0 && (
                        <ScrollView style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12, marginBottom: 20 }}>
                            {guesses.slice().reverse().map((g, i) => (
                                <View key={i} style={{
                                    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
                                    backgroundColor: g.correct ? 'rgba(126, 207, 160, 0.15)' : 'transparent',
                                    padding: 8, borderRadius: 8
                                }}>
                                    <Text style={{ marginRight: 8, fontSize: 16 }}>{g.correct ? '✅' : '❌'}</Text>
                                    <Text style={{ color: '#8A8FA8', marginRight: 8, fontSize: 13, fontWeight: 'bold' }}>{g.guesser}:</Text>
                                    <Text style={{ color: g.correct ? '#7ECFA0' : 'white', fontSize: 15, fontWeight: g.correct ? 'bold' : 'normal' }}>{g.guess}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {/* New Round */}
                    {phase === 'revealed' && (
                        <TouchableOpacity
                            onPress={resetGame}
                            style={{ backgroundColor: '#E8788A', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 20 }}
                        >
                            <RefreshCw color="white" size={20} />
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>New Round</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

