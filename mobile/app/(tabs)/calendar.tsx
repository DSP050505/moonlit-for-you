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
        <View style={{ marginBottom: 16, backgroundColor: '#141829', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 8 }}>{item.title}</Text>
                <View style={{ backgroundColor: 'rgba(242, 167, 195, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(242, 167, 195, 0.2)' }}>
                    <Text style={{ color: '#F2A7C3', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
            {item.description ? (
                <Text style={{ color: '#8A8FA8', fontSize: 14, lineHeight: 20 }}>{item.description}</Text>
            ) : null}
            <Text style={{ color: 'rgba(138, 143, 168, 0.4)', fontSize: 10, marginTop: 12 }}>
                Created on {new Date(item.date).getFullYear()}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0B0E1A', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#F2A7C3" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEvent}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 48, marginBottom: 16 }}>📅</Text>
                        <Text style={{ color: '#8A8FA8', fontSize: 16 }}>No special moments yet.</Text>
                        <Text style={{ color: 'rgba(138, 143, 168, 0.6)', fontSize: 14 }}>Add one to start our timeline!</Text>
                    </View>
                }
            />
            
            <TouchableOpacity style={{ position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, backgroundColor: '#E8788A', borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#E8788A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 }}>
                <Plus size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}
