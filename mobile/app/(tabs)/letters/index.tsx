import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { ArrowLeft, PenLine, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function LettersScreen() {
    const { session } = useAuth();
    const router = useRouter();
    const [letters, setLetters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session) return;
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
        
        fetch(`${API_URL}/api/letters?roomId=${session.room.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.letters) setLetters(data.letters);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('📱 Letters: Fetch error', err);
                setIsLoading(false);
            });
    }, [session]);

    const renderLetter = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={{ marginBottom: 16, backgroundColor: '#141829', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            activeOpacity={0.8}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 32, height: 32, backgroundColor: 'rgba(242, 167, 195, 0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(242, 167, 195, 0.2)' }}>
                    <Mail size={16} color="#F2A7C3" />
                </View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{item.title}</Text>
            </View>
            <Text style={{ color: '#8A8FA8', fontSize: 14, lineHeight: 24, marginBottom: 16 }} numberOfLines={3}>
                {item.content}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: 'rgba(138, 143, 168, 0.4)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    DEAR {item.recipient === 'Rishika' ? 'RISHIKA' : 'DSP'}
                </Text>
                <Text style={{ color: 'rgba(242, 167, 195, 0.6)', fontSize: 10, fontWeight: 'bold' }}>
                    {new Date(item.date || Date.now()).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
            {/* Custom Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Love Letters</Text>
                <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <PenLine size={20} color="#F2A7C3" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color="#F2A7C3" />
                </View>
            ) : (
                <FlatList
                    data={letters}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderLetter}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>✍️</Text>
                            <Text style={{ color: '#8A8FA8', fontSize: 16 }}>The ink hasn't touched the paper yet.</Text>
                            <Text style={{ color: 'rgba(138, 143, 168, 0.6)', fontSize: 14, marginTop: 4, textAlign: 'center', paddingHorizontal: 40 }}>Write something sweet on the web app to store it forever.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
