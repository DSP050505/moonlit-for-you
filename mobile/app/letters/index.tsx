import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
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
            className="mb-4 bg-secondary p-6 rounded-[32px] border border-white/5 shadow-sm"
            activeOpacity={0.8}
        >
            <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-pink/10 rounded-full items-center justify-center mr-3 border border-pink/20">
                    <Mail size={16} color="#F2A7C3" />
                </View>
                <Text className="text-white font-bold text-lg">{item.title}</Text>
            </View>
            <Text className="text-muted text-sm leading-6 mb-4" numberOfLines={3} style={{ fontFamily: 'Inter' }}>
                {item.content}
            </Text>
            <View className="flex-row justify-between items-center pt-4 border-t border-white/5">
                <Text className="text-muted/40 text-[10px] uppercase font-bold tracking-widest">
                    DEAR {item.recipient === 'Rishika' ? 'RISHIKA' : 'DSP'}
                </Text>
                <Text className="text-pink/60 text-[10px] font-bold">
                    {new Date(item.date || Date.now()).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-primary">
            {/* Custom Header */}
            <View className="px-6 pt-12 pb-6 flex-row items-center justify-between border-b border-white/5">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-heading">Love Letters</Text>
                <TouchableOpacity className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                    <PenLine size={20} color="#F2A7C3" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#F2A7C3" />
                </View>
            ) : (
                <FlatList
                    data={letters}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderLetter}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-white/20 text-5xl mb-4">✍️</Text>
                            <Text className="text-muted text-base">The ink hasn't touched the paper yet.</Text>
                            <Text className="text-muted/60 text-sm mt-1 text-center px-10">Write something sweet on the web app to store it forever.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
