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
        <View style={{ flex: 1, backgroundColor: '#0B0E1A', padding: 24, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#141829', padding: 40, borderRadius: 50, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', width: '100%', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}>
                <View style={{ width: 80, height: 80, backgroundColor: 'rgba(242, 167, 195, 0.1)', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(242, 167, 195, 0.2)' }}>
                    <Compass size={40} color="#F2A7C3" />
                </View>
                
                <Text style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 4, fontSize: 12, marginBottom: 8 }}>Distance Between Us</Text>
                
                {distance !== null ? (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 72, fontWeight: 'bold', marginBottom: 8 }}>{distance}</Text>
                        <Text style={{ color: '#F2A7C3', fontSize: 24, fontWeight: '600' }}>Kilometers</Text>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <ActivityIndicator color="#F2A7C3" style={{ marginBottom: 16 }} />
                        <Text style={{ color: '#8A8FA8', textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 }}>
                            Waiting for someone to share their location...
                        </Text>
                        <Text style={{ color: 'rgba(242, 167, 195, 0.6)', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>Connect on web to sync!</Text>
                    </View>
                )}
                
                <View style={{ marginTop: 48, width: '100%', paddingTop: 32, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: 12, fontStyle: 'italic' }}>
                        "Distance means so little when someone means so much."
                    </Text>
                </View>
            </View>

            <View style={{ marginTop: 32, paddingHorizontal: 24 }}>
                <Text style={{ color: 'rgba(138, 143, 168, 0.4)', textAlign: 'center', fontSize: 10, lineHeight: 16 }}>
                    Mobile app location sharing coming soon. Use the web app to update your current position.
                </Text>
            </View>
        </View>
    );
}
