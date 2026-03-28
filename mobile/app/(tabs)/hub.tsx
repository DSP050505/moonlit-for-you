import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image, Heart, Gift, Mail, Gamepad2, Sparkles, LogOut } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';

export default function HubScreen() {
    const router = useRouter();
    const { logout, session } = useAuth();

    const features = [
        { id: 'gallery', title: 'Gallery', icon: Image, color: '#C4B1D4', route: '/gallery' },
        { id: 'letters', title: 'Letters', icon: Mail, color: '#F2A7C3', route: '/letters' },
        { id: 'games', title: 'Games', icon: Gamepad2, color: '#F5D380', route: '/games' },
        { id: 'surprises', title: 'Surprises', icon: Sparkles, color: '#7ECFA0', route: '/surprises' },
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#0B0E1A', padding: 24 }}>
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
                <View style={{ width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 }}>
                    <Heart size={32} color="#E8788A" fill="#E8788A" />
                </View>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Our Hub</Text>
                <Text style={{ color: '#8A8FA8', fontSize: 14, marginTop: 4 }}>Everything shared, just for us.</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {features.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(item.route as any)}
                        style={{ width: '47%', backgroundColor: '#141829', aspectRatio: 1, borderRadius: 40, padding: 24, marginBottom: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
                        activeOpacity={0.7}
                    >
                        <View style={{ backgroundColor: `${item.color}15`, padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: `${item.color}30` }}>
                            <item.icon size={28} color={item.color} />
                        </View>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ marginTop: 32, marginBottom: 48 }}>
                <TouchableOpacity 
                    onPress={() => logout()}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <LogOut size={20} color="#8A8FA8" style={{ marginRight: 12 }} />
                    <Text style={{ color: '#8A8FA8', fontWeight: 'bold', marginLeft: 8 }}>Sign Out of Room</Text>
                </TouchableOpacity>
                
                <Text style={{ color: 'rgba(138, 143, 168, 0.2)', textAlign: 'center', marginTop: 24, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
                    BetweenUs Mobile • v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}
