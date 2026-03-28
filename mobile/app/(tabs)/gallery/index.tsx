import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { ArrowLeft, Camera, Heart, X, Trash2, Image as ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');
const columnWidth = (width - 48) / 2;

export default function GalleryScreen() {
    const { session } = useAuth();
    const router = useRouter();
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isUploading, setIsUploading] = useState(false);

    // Lightbox State
    const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchPhotos = async () => {
        if (!session) return;
        try {
            const res = await fetch(`${API_URL}/api/photos?roomId=${session.room.id}`);
            const data = await res.json();
            if (data.photos) setPhotos(data.photos);
        } catch (err) {
            console.error('📱 Gallery: Fetch error', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [session]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0].uri) {
            setSelectedImageUri(result.assets[0].uri);
            setCaption('');
            setDate(new Date().toISOString().split('T')[0]);
            setShowUploadModal(true);
        }
    };

    const handleUpload = async () => {
        if (!selectedImageUri || !session) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            
            // Append file
            const filename = selectedImageUri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('photo', {
                uri: selectedImageUri,
                name: filename,
                type: type,
            } as any);

            formData.append('roomId', String(session.room.id));
            formData.append('uploadedBy', session.user.role);
            if (caption.trim()) formData.append('caption', caption.trim());
            if (date) formData.append('takenAt', date);

            const res = await fetch(`${API_URL}/api/photos`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setPhotos(prev => [data.photo, ...prev]);
            setShowUploadModal(false);
            setSelectedImageUri(null);
        } catch (err) {
            console.error('Upload error:', err);
            Alert.alert('Upload Failed', 'There was an error saving your memory. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/api/photos/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Delete failed');
            }
            setPhotos(prev => prev.filter(p => p.id !== id));
            setSelectedPhoto(null);
        } catch (err) {
            console.error('Error deleting photo:', err);
            Alert.alert('Delete Failed', 'Could not delete the photo.');
        } finally {
            setIsDeleting(false);
        }
    };

    const renderPhoto = ({ item }: { item: any }) => {
        const imageUrl = item.url.startsWith('http') ? item.url : `${API_URL}${item.url}`;
        
        return (
            <TouchableOpacity 
                style={{ marginBottom: 16, backgroundColor: '#141829', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
                activeOpacity={0.8}
                onPress={() => setSelectedPhoto(item)}
            >
                <Image 
                    source={{ uri: imageUrl }} 
                    style={{ width: columnWidth, aspectRatio: 1, backgroundColor: '#1C2038' }}
                    resizeMode="cover"
                />
                <View style={{ padding: 10, backgroundColor: 'rgba(20, 24, 41, 0.85)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
                        {item.caption || 'No caption'}
                    </Text>
                    {item.takenAt && (
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                            {new Date(item.takenAt).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
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
                    contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 }}>
                            <Text style={{ fontSize: 64, marginBottom: 16 }}>💫</Text>
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No Memories Yet</Text>
                            <Text style={{ color: '#8A8FA8', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
                                Start capturing your special moments together!
                            </Text>
                            <TouchableOpacity onPress={pickImage} style={{ marginTop: 24, backgroundColor: '#E8788A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>📷 Add First Memory</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
            
            <View style={{ position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
                <View style={{ backgroundColor: 'rgba(20, 24, 41, 0.9)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(242, 167, 195, 0.2)', flexDirection: 'row', alignItems: 'center' }}>
                    <Heart size={14} color="#F2A7C3" fill="#F2A7C3" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#F2A7C3', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }}>{photos.length} Captured</Text>
                </View>
            </View>

            {/* Floating Action Button for Upload */}
            <TouchableOpacity 
                onPress={pickImage} 
                style={{ position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, backgroundColor: '#E8788A', borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            >
                <Camera size={24} color="white" />
            </TouchableOpacity>

            {/* Upload Modal */}
            <Modal visible={showUploadModal} animationType="slide" transparent={true}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(5, 7, 15, 0.9)', justifyContent: 'flex-end' }}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
                            <View style={{ backgroundColor: '#141829', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Add a Memory</Text>
                                    <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                                        <X size={24} color="#8A8FA8" />
                                    </TouchableOpacity>
                                </View>

                                {selectedImageUri && (
                                    <Image source={{ uri: selectedImageUri }} style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 20 }} resizeMode="contain" />
                                )}

                                <TextInput
                                    placeholder="Write a caption..."
                                    placeholderTextColor="#8A8FA8"
                                    value={caption}
                                    onChangeText={setCaption}
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                                />

                                <TextInput
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#8A8FA8"
                                    value={date}
                                    onChangeText={setDate}
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', padding: 16, borderRadius: 16, marginBottom: 24, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}
                                />

                                <TouchableOpacity 
                                    onPress={handleUpload}
                                    disabled={isUploading}
                                    style={{ backgroundColor: '#E8788A', padding: 16, borderRadius: 16, alignItems: 'center', opacity: isUploading ? 0.7 : 1 }}
                                >
                                    {isUploading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>💕 Save Memory</Text>}
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Lightbox Modal */}
            <Modal visible={!!selectedPhoto} animationType="fade" transparent={true}>
                {selectedPhoto && (
                    <View style={{ flex: 1, backgroundColor: 'rgba(5, 7, 15, 0.95)' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48, zIndex: 10 }}>
                            <TouchableOpacity onPress={() => setSelectedPhoto(null)} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }}>
                                <ArrowLeft size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(selectedPhoto.id)} disabled={isDeleting} style={{ padding: 8, backgroundColor: 'rgba(255, 70, 70, 0.15)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 70, 70, 0.3)' }}>
                                {isDeleting ? <ActivityIndicator size="small" color="#FF7878" /> : <Trash2 size={20} color="#FF7878" />}
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                            <Image 
                                source={{ uri: selectedPhoto.url.startsWith('http') ? selectedPhoto.url : `${API_URL}${selectedPhoto.url}` }} 
                                style={{ width: '100%', height: '65%', borderRadius: 16 }} 
                                resizeMode="contain" 
                            />
                            
                            <View style={{ marginTop: 24, alignItems: 'center', width: '100%' }}>
                                {selectedPhoto.caption ? (
                                    <Text style={{ color: '#F2A7C3', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
                                        {selectedPhoto.caption}
                                    </Text>
                                ) : null}
                                {selectedPhoto.takenAt ? (
                                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 8 }}>
                                        {new Date(selectedPhoto.takenAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Text>
                                ) : null}
                                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                                    Added by {selectedPhoto.uploadedBy}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
}
