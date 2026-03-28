import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
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
            style={{ marginBottom: 16, backgroundColor: '#141829', borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            activeOpacity={0.9}
        >
            <Image 
                source={{ uri: item.url }} 
                style={{ width: columnWidth, aspectRatio: 1, backgroundColor: '#1C2038' }}
                resizeMode="cover"
            />
            <View style={{ padding: 12, backgroundColor: 'rgba(20, 24, 41, 0.8)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', paddingHorizontal: 8 }} numberOfLines={1}>
                    {item.caption || 'No caption'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
            {/* Custom Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Our Gallery</Text>
                <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={20} color="#F2A7C3" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>🖼️</Text>
                            <Text style={{ color: '#8A8FA8', fontSize: 16 }}>No photos shared yet.</Text>
                            <Text style={{ color: 'rgba(138, 143, 168, 0.6)', fontSize: 14, marginTop: 4 }}>Capture a moment on web to see it here!</Text>
                        </View>
                    }
                />
            )}
            
            <View style={{ position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center' }}>
                <View style={{ backgroundColor: 'rgba(20, 24, 41, 0.9)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(242, 167, 195, 0.2)', flexDirection: 'row', alignItems: 'center' }}>
                    <Heart size={14} color="#F2A7C3" fill="#F2A7C3" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#F2A7C3', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }}>Shared Memories</Text>
                </View>
            </View>
        </View>
    );
}
