import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Plus } from 'lucide-react-native';

interface Event {
    id: number;
    title: string;
    date: string;
    description?: string;
}

export default function CalendarScreen() {
    const { session } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session) return;
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
        
        console.log('📱 Calendar: Fetching events...');
        fetch(`${API_URL}/api/events?roomId=${session.room.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.events) setEvents(data.events);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('📱 Calendar: Fetch error', err);
                setIsLoading(false);
            });
    }, [session]);

    const renderEvent = ({ item }: { item: Event }) => (
        <View className="mb-4 bg-secondary p-5 rounded-3xl border border-white/5 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-white text-lg font-bold flex-1 mr-2">{item.title}</Text>
                <View className="bg-pink/10 px-3 py-1 rounded-full border border-pink/20">
                    <Text className="text-pink text-[10px] font-bold uppercase tracking-wider">
                        {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
            {item.description ? (
                <Text className="text-muted text-sm leading-5">{item.description}</Text>
            ) : null}
            <Text className="text-muted/40 text-[10px] mt-3">
                Created on {new Date(item.date).getFullYear()}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <View className="flex-1 bg-primary justify-center items-center">
                <ActivityIndicator color="#F2A7C3" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-primary">
            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEvent}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Text className="text-white/20 text-5xl mb-4">📅</Text>
                        <Text className="text-muted text-base">No special moments yet.</Text>
                        <Text className="text-muted/60 text-sm">Add one to start our timeline!</Text>
                    </View>
                }
            />
            
            <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-rose rounded-full items-center justify-center shadow-lg shadow-rose/40">
                <Plus size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}
