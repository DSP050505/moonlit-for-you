import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Sparkles, Gift, Wand2, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SurprisesScreen() {
    const router = useRouter();

    const surprises = [
        { id: 'wish', title: 'Make a Wish', icon: Wand2, color: '#C4B1D4' },
        { id: 'gift', title: 'Virtual Gift', icon: Gift, color: '#F2A7C3' },
        { id: 'secret', title: 'Hidden Note', icon: Heart, color: '#E8788A' },
    ];

    return (
        <View className="flex-1 bg-primary">
            {/* Custom Header */}
            <View className="px-6 pt-12 pb-6 flex-row items-center justify-between border-b border-white/5">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-heading">Surprise Box</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="items-center py-10">
                    <View className="w-24 h-24 bg-pink/5 rounded-full items-center justify-center border border-pink/20 mb-6 shadow-xl shadow-pink/10">
                        <Sparkles size={48} color="#F2A7C3" />
                    </View>
                    <Text className="text-white text-2xl font-bold">Magic Awaits</Text>
                    <Text className="text-muted text-center mt-2 px-10 leading-5">
                        These treasures are best discovered on our web platform.
                    </Text>
                </View>

                {surprises.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        className="mb-4 bg-secondary p-6 rounded-[40px] border border-white/5 items-center flex-row"
                        activeOpacity={0.8}
                    >
                        <View style={{ backgroundColor: `${item.color}15` }} className="w-16 h-16 rounded-[22px] items-center justify-center mr-6 border" borderColor={`${item.color}30`}>
                            <item.icon size={30} color={item.color} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-xl">{item.title}</Text>
                            <Text className="text-muted text-xs mt-1">Unlock a moment of joy.</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="bg-surface/30 p-8 rounded-[50px] mt-8 border border-white/5 items-center">
                    <Text className="text-white/20 text-4xl mb-3">🎁</Text>
                    <Text className="text-white/40 text-center text-sm italic">
                        "The best surprises are the ones shared together."
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
