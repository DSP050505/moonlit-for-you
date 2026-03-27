import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ArrowLeft, Gamepad2, Trophy, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function GamesScreen() {
    const router = useRouter();

    const games = [
        { id: 'quiz', title: 'Our Quiz', description: 'How well do we know each other?', icon: Star, color: '#F5D380' },
        { id: 'memory', title: 'Memory Cards', description: 'Match our favorite moments.', icon: Gamepad2, color: '#C4B1D4' },
        { id: 'truth', title: 'Truth or Dare', description: 'Spice things up with secrets.', icon: Trophy, color: '#F2A7C3' },
    ];

    return (
        <View className="flex-1 bg-primary">
            {/* Custom Header */}
            <View className="px-6 pt-12 pb-6 flex-row items-center justify-between border-b border-white/5">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-heading">Games Plaza</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="mb-8 items-center pt-4">
                    <View className="bg-pink/10 p-5 rounded-full mb-4 border border-pink/20">
                        <Gamepad2 size={40} color="#F2A7C3" />
                    </View>
                    <Text className="text-white text-lg font-bold">Ready to play?</Text>
                    <Text className="text-muted text-sm mt-1 text-center px-10">
                        Games are currently optimized for the web experience. Play on web to win prizes!
                    </Text>
                </View>

                {games.map((game) => (
                    <TouchableOpacity 
                        key={game.id}
                        className="mb-4 bg-secondary p-6 rounded-[32px] border border-white/5 flex-row items-center"
                        activeOpacity={0.8}
                    >
                        <View style={{ backgroundColor: `${game.color}15` }} className="w-14 h-14 rounded-2xl items-center justify-center mr-5 border" borderColor={`${game.color}30`}>
                            <game.icon size={28} color={game.color} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-lg">{game.title}</Text>
                            <Text className="text-muted text-xs mt-1">{game.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="mt-6 bg-white/5 p-6 rounded-[40px] border border-white/10 items-center">
                    <Text className="text-pink text-xs font-bold uppercase tracking-[3px] mb-2">Coming Soon</Text>
                    <Text className="text-white/60 text-center text-xs px-6 italic">
                        Native mobile games are being crafted with love. Check back shortly for updates!
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
