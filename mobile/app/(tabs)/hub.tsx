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
        <ScrollView className="flex-1 bg-primary p-6">
            <View className="mb-10 items-center">
                <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center border border-white/10 mb-4 shadow-sm">
                    <Heart size={32} color="#E8788A" fill="#E8788A" />
                </View>
                <Text className="text-white text-2xl font-bold font-heading">Our Hub</Text>
                <Text className="text-muted text-sm mt-1">Everything shared, just for us.</Text>
            </View>

            <View className="flex-row flex-wrap justify-between">
                {features.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(item.route as any)}
                        className="w-[47%] bg-secondary aspect-square rounded-[40px] p-6 mb-6 items-center justify-center border border-white/5 shadow-md"
                        activeOpacity={0.7}
                    >
                        <View style={{ backgroundColor: `${item.color}15` }} className="p-4 rounded-3xl mb-3 border" borderColor={`${item.color}30`}>
                            <item.icon size={28} color={item.color} />
                        </View>
                        <Text className="text-white font-semibold text-base">{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="mt-8 mb-12">
                <TouchableOpacity 
                    onPress={() => logout()}
                    className="flex-row items-center justify-center bg-white/5 p-5 rounded-3xl border border-white/10"
                >
                    <LogOut size={20} color="#8A8FA8" className="mr-3" />
                    <Text className="text-[#8A8FA8] font-semibold ml-2">Sign Out of Room</Text>
                </TouchableOpacity>
                
                <Text className="text-muted/20 text-center mt-6 text-[10px] uppercase tracking-widest">
                    BetweenUs Mobile • v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}
