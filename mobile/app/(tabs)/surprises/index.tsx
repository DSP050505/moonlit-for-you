import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../../hooks/useAuth';
import { Gift, Plus, X, Trash2 } from 'lucide-react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Surprise {
    id: number;
    title: string;
    content: string;
    revealDate: string;
    createdBy: string;
    isRevealed: boolean;
}

export default function SurprisesScreen() {
    const { session } = useAuth();
    const roomId = session?.room.id;
    const [surprises, setSurprises] = useState<Surprise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [revealDate, setRevealDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => { fetchSurprises(); }, [roomId]);

    const fetchSurprises = async () => {
        if (!roomId) return;
        try {
            const res = await fetch(`${API_URL}/api/surprises?roomId=${roomId}`);
            const data = await res.json();
            setSurprises(data.surprises || []);
        } catch (err) { console.error('Failed to fetch surprises:', err); }
        finally { setIsLoading(false); }
    };

    const handleAddSurprise = async () => {
        if (!roomId || !session?.user.role || !title.trim() || !content.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all fields (Title and Content).');
            return;
        }
        try {
            const dateStr = revealDate.toISOString().split('T')[0];
            const res = await fetch(`${API_URL}/api/surprises`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, title, content, revealDate: dateStr, createdBy: session.user.role }),
            });
            if (res.ok) {
                setTitle(''); setContent(''); setRevealDate(new Date());
                setIsModalOpen(false);
                fetchSurprises();
            }
        } catch (err) { console.error('Failed to add surprise:', err); }
    };

    const deleteSurprise = (id: number) => {
        Alert.alert('Delete Surprise', 'Are you sure you want to delete this surprise?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    await fetch(`${API_URL}/api/surprises/${id}`, { method: 'DELETE' });
                    setSurprises(surprises.filter(s => s.id !== id));
                } catch (err) { console.error('Failed to delete surprise:', err); }
            }},
        ]);
    };

    if (isLoading) {
        return <View style={{ flex: 1, backgroundColor: '#0B0E1A', justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#F2A7C3" /></View>;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 24, paddingTop: 8 }}>
                    <Text style={{ color: '#F2A7C3', fontSize: 14, marginBottom: 16 }}>Secret moments waiting for the right time... ✨</Text>
                    <TouchableOpacity onPress={() => setIsModalOpen(true)}
                        style={{ backgroundColor: '#E8788A', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, elevation: 5, shadowColor: '#E8788A', shadowOpacity: 0.4, shadowRadius: 12 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }}>+ HIDE A SURPRISE</Text>
                    </TouchableOpacity>
                </View>

                {/* Surprise Cards */}
                {surprises.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Text style={{ fontSize: 64, marginBottom: 24, opacity: 0.5 }}>🎁</Text>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No surprises yet</Text>
                        <Text style={{ color: '#8A8FA8', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 }}>
                            The box is quiet... for now. Why not hide a little something special for later?
                        </Text>
                    </View>
                ) : (
                    surprises.map(surprise => (
                        <SurpriseCard key={surprise.id} surprise={surprise} onDelete={() => deleteSurprise(surprise.id)} />
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Create Modal */}
            <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={{ width: '100%', maxWidth: 480, backgroundColor: 'rgba(23, 27, 48, 0.98)', padding: 32, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>Hide a New Surprise</Text>

                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Title</Text>
                        <TextInput value={title} onChangeText={setTitle} placeholder="E.g., A Little Something Special"
                            placeholderTextColor="#8A8FA8" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, color: 'white', fontSize: 15, marginBottom: 16 }} />

                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>The Secret Content</Text>
                        <TextInput value={content} onChangeText={setContent} placeholder="What should be revealed?"
                            placeholderTextColor="#8A8FA8" multiline numberOfLines={4} textAlignVertical="top"
                            style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, color: 'white', fontSize: 15, marginBottom: 16, minHeight: 100 }} />

                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Reveal Date</Text>
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                value={revealDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setRevealDate(selectedDate);
                                }}
                                style={{ marginBottom: 20, alignSelf: 'flex-start' }}
                                themeVariant="dark"
                            />
                        ) : (
                            <>
                                <TouchableOpacity 
                                    onPress={() => setShowDatePicker(true)}
                                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 20 }}
                                >
                                    <Text style={{ color: 'white', fontSize: 15 }}>
                                        {revealDate.toISOString().split('T')[0]}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={revealDate}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (event?.type === 'set' && selectedDate) {
                                                setRevealDate(selectedDate);
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)}
                                style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddSurprise}
                                style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#E8788A', alignItems: 'center', elevation: 5, shadowColor: '#E8788A', shadowOpacity: 0.4, shadowRadius: 12 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Hide It! ✨</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function SurpriseCard({ surprise, onDelete }: { surprise: Surprise; onDelete: () => void }) {
    const isRevealed = surprise.isRevealed;
    const revealDate = new Date(surprise.revealDate);
    const day = revealDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <View style={{ backgroundColor: '#141829', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: isRevealed ? 'rgba(242,167,195,0.15)' : 'rgba(255,255,255,0.05)' }}>
            {/* Top Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{
                    backgroundColor: isRevealed ? 'rgba(242,167,195,0.1)' : 'rgba(255,255,255,0.05)',
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)',
                }}>
                    <Text style={{ color: isRevealed ? '#F2A7C3' : '#8A8FA8', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {isRevealed ? '✨ REVEALED' : `🕒 REVEALS ${day}`}
                    </Text>
                </View>
                <TouchableOpacity onPress={onDelete} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>{surprise.title}</Text>

            {/* Content */}
            {isRevealed ? (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(242,167,195,0.15)' }}>
                    <Text style={{ color: '#EDE9F5', fontSize: 15, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 }}>
                        "{surprise.content}"
                    </Text>
                    <Text style={{ color: '#8A8FA8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 12 }}>
                        FROM {surprise.createdBy === 'DSP' ? 'DEVI SRI PRASAD' : 'RISHIKA'}
                    </Text>
                </View>
            ) : (
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                    <Text style={{ fontSize: 64, marginBottom: 12 }}>🎁</Text>
                    <Text style={{ color: '#8A8FA8', fontSize: 13 }}>A secret is hiding here...</Text>
                </View>
            )}
        </View>
    );
}
