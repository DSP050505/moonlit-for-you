import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { Map as MapIcon, Compass } from 'lucide-react-native';

export default function MapScreen() {
    const { session } = useAuth();
    const { socket } = useSocket();
    const [locations, setLocations] = useState<Record<string, { lat: number, lon: number, time: number }>>({});
    const [distance, setDistance] = useState<number | null>(null);

    const isRishika = session?.user.role === 'Rishika';
    const partnerRole = isRishika ? 'DSP' : 'Rishika';
    const partnerName = isRishika ? 'Devi Sri Prasad' : 'Rishika';

    // Calculate distance Helper
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('location:update', (data: any) => {
            console.log('📱 Map: Received location update', data);
            setLocations(prev => ({
                ...prev,
                [data.role]: { lat: data.latitude, lon: data.longitude, time: Date.now() }
            }));
        });

        return () => { socket.off('location:update'); };
    }, [socket]);

    useEffect(() => {
        const myLoc = locations[session?.user.role || ''];
        const partnerLoc = locations[partnerRole];

        if (myLoc && partnerLoc) {
            setDistance(calculateDistance(myLoc.lat, myLoc.lon, partnerLoc.lat, partnerLoc.lon));
        }
    }, [locations, session, partnerRole]);

    return (
        <View className="flex-1 bg-primary p-6 items-center justify-center">
            <View className="bg-secondary p-10 rounded-[50px] items-center border border-white/5 shadow-2xl w-full">
                <View className="w-20 h-20 bg-pink/10 rounded-full items-center justify-center mb-6 border border-pink/20">
                    <Compass size={40} color="#F2A7C3" />
                </View>
                
                <Text className="text-white/60 uppercase tracking-[4px] text-xs mb-2">Distance Between Us</Text>
                
                {distance !== null ? (
                    <View className="items-center">
                        <Text className="text-white text-7xl font-bold mb-2">{distance}</Text>
                        <Text className="text-pink text-2xl font-semibold">Kilometers</Text>
                    </View>
                ) : (
                    <View className="items-center py-6">
                        <ActivityIndicator color="#F2A7C3" className="mb-4" />
                        <Text className="text-muted text-center leading-5 px-6">
                            Waiting for someone to share their location...
                        </Text>
                        <Text className="text-pink/60 text-xs mt-2 italic">Connect on web to sync!</Text>
                    </View>
                )}
                
                <View className="mt-12 w-full pt-8 border-t border-white/5">
                    <Text className="text-white/30 text-center text-xs italic">
                        "Distance means so little when someone means so much."
                    </Text>
                </View>
            </View>

            <View className="mt-8 px-6">
                <Text className="text-muted/40 text-center text-[10px] leading-4">
                    Mobile app location sharing coming soon. Use the web app to update your current position.
                </Text>
            </View>
        </View>
    );
}
