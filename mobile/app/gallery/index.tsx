import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Camera, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const columnWidth = (width - 48) / 2;

export default function GalleryScreen() {
    const { session } = useAuth();
    const router = useRouter();
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session) return;
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
        
        fetch(`${API_URL}/api/gallery?roomId=${session.room.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.photos) setPhotos(data.photos);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('📱 Gallery: Fetch error', err);
                setIsLoading(false);
            });
    }, [session]);

    const renderPhoto = ({ item }: { item: any }) => (
        <TouchableOpacity 
            className="mb-4 bg-secondary rounded-[32px] overflow-hidden border border-white/5"
            activeOpacity={0.9}
        >
            <Image 
                source={{ uri: item.url }} 
                className="w-full aspect-square bg-[#1C2038]"
                resizeMode="cover"
            />
            <View className="p-3 bg-secondary/80 absolute bottom-0 left-0 right-0 backdrop-blur-md">
                <Text className="text-white text-xs font-semibold px-2" numberOfLines={1}>
                    {item.caption || 'No caption'}
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
                <Text className="text-white text-xl font-bold font-heading">Our Gallery</Text>
                <TouchableOpacity className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                    <Camera size={20} color="#F2A7C3" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#F2A7C3" />
                </View>
            ) : (
                <FlatList
                    data={photos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPhoto}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-white/20 text-5xl mb-4">🖼️</Text>
                            <Text className="text-muted text-base">No photos shared yet.</Text>
                            <Text className="text-muted/60 text-sm mt-1">Capture a moment on web to see it here!</Text>
                        </View>
                    }
                />
            )}
            
            <View className="absolute bottom-8 left-0 right-0 items-center pointer-events-none">
                <View className="bg-[#141829]/90 px-6 py-3 rounded-full border border-pink/20 shadow-xl shadow-pink/10 flex-row items-center">
                    <Heart size={14} color="#F2A7C3" fill="#F2A7C3" className="mr-2" />
                    <Text className="text-pink text-xs font-bold tracking-[2px] uppercase ml-2">Shared Memories</Text>
                </View>
            </View>
        </View>
    );
}
