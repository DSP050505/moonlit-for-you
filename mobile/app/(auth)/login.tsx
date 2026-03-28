import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
// For now, I'll use standard RN components
import { useAuth, Role } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginScreen() {
    const { login } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'join' | 'create'>('join');
    const [roomName, setRoomName] = useState('');
    const [passcode, setPasscode] = useState('');
    const [role, setRole] = useState<Role>('Juliet');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!roomName || !passcode) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setIsLoading(true);
        console.log(`📱 Login: ${mode} room ${roomName} as ${role}`);

        try {
            const endpoint = mode === 'join' ? '/api/auth/join-room' : '/api/auth/create-room';
            const body = mode === 'join'
                ? { name: roomName, passcode, role }
                : { name: roomName, passcode };

            const url = `${API_URL}${endpoint}`;
            console.log(`📱 Login: Fetching POST ${url}`);
            console.log(`📱 Login: Body = ${JSON.stringify(body)}`);

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            console.log(`📱 Login: Response status = ${res.status}`);
            const data = await res.json();
            console.log('📱 Login: Response data =', JSON.stringify(data));

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (mode === 'create') {
                // Auto-join after create
                const joinUrl = `${API_URL}/api/auth/join-room`;
                const joinBody = { name: roomName, passcode, role };
                console.log(`📱 Login: Auto-joining POST ${joinUrl}`);
                console.log(`📱 Login: Join body = ${JSON.stringify(joinBody)}`);

                const joinRes = await fetch(joinUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(joinBody),
                });
                console.log(`📱 Login: Join response status = ${joinRes.status}`);
                const joinData = await joinRes.json();
                console.log(`📱 Login: Join response data = ${JSON.stringify(joinData)}`);
                if (!joinRes.ok) throw new Error(joinData.error || 'Failed to join room');
                await login({ room: joinData.room, user: joinData.user });
            } else {
                await login({ room: data.room, user: data.user });
            }

            console.log('📱 Login: Success');
            router.replace('/');
        } catch (err: any) {
            console.error('📱 Login: Error', err.message);
            setError(err.message);
            Alert.alert('Error', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/login.png')}
            style={{ flex: 1, backgroundColor: '#0B0E1A' }}
            resizeMode="contain"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
                <ScrollView
                    style={{ paddingHorizontal: 32, paddingVertical: 16 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 32,
                            fontWeight: 'bold',
                            marginBottom: 8,
                            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                            textAlign: 'center'
                        }}>
                            BetweenUs
                        </Text>
                        <Text style={{
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                            letterSpacing: 3,
                            fontSize: 9,
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            Enter our private sky
                        </Text>
                    </View>

                    {/* Login Fields */}
                    <View
                        style={{
                            width: '100%',
                            maxWidth: 240,
                            alignSelf: 'center',
                        }}
                    >

                        {/* Mode Toggle */}
                        <View style={{
                            flexDirection: 'column',
                            gap: 6,
                            marginBottom: 20
                        }}>
                            <TouchableOpacity
                                onPress={() => setMode('join')}
                                style={{ paddingVertical: 10, borderRadius: 20, backgroundColor: mode === 'join' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', borderWidth: 1, borderColor: mode === 'join' ? 'rgba(255,255,255,0.2)' : 'transparent' }}
                            >
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 11, color: mode === 'join' ? 'white' : 'rgba(255,255,255,0.5)' }}>
                                    Join Room
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode('create')}
                                style={{ paddingVertical: 10, borderRadius: 20, backgroundColor: mode === 'create' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', borderWidth: 1, borderColor: mode === 'create' ? 'rgba(255,255,255,0.2)' : 'transparent' }}
                            >
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 11, color: mode === 'create' ? 'white' : 'rgba(255,255,255,0.5)' }}>
                                    Create Room
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ gap: 12 }}>
                            {/* Room Name */}
                            <View>
                                <Text style={{ color: 'white', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, marginLeft: 6, fontWeight: '700' }}>Room Name</Text>
                                <TextInput
                                    value={roomName}
                                    onChangeText={setRoomName}
                                    placeholder="e.g. OurLittleWorld"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    style={{
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        borderRadius: 10,
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        color: 'white',
                                        fontSize: 13
                                    }}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Passcode */}
                            <View>
                                <Text style={{ color: 'white', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, marginLeft: 6, fontWeight: '700' }}>Passcode</Text>
                                <TextInput
                                    value={passcode}
                                    onChangeText={setPasscode}
                                    placeholder="Secret key..."
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    style={{
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        borderRadius: 10,
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        color: 'white',
                                        fontSize: 13
                                    }}
                                    secureTextEntry
                                />
                            </View>

                            {/* Role Selection */}
                            <View>
                                <Text style={{ color: 'white', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, marginLeft: 6, fontWeight: '700' }}>I am...</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setRole('Juliet')}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            borderRadius: 10,
                                            borderWidth: 1.5,
                                            borderColor: role === 'Juliet' ? 'rgba(242, 167, 195, 0.4)' : 'transparent',
                                            backgroundColor: 'rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: role === 'Juliet' ? 'white' : 'rgba(255,255,255,0.3)' }}>Juliet</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setRole('Romeo')}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            borderRadius: 10,
                                            borderWidth: 1.5,
                                            borderColor: role === 'Romeo' ? 'rgba(242, 167, 195, 0.4)' : 'transparent',
                                            backgroundColor: 'rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: role === 'Romeo' ? 'white' : 'rgba(255,255,255,0.3)' }}>Romeo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {error ? <Text style={{ color: '#F2A7C3', textAlign: 'center', fontSize: 13, marginTop: -4 }}>{error}</Text> : null}

                            {/* Enter Room Button */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isLoading}
                                style={{
                                    marginTop: 6,
                                    paddingVertical: 12,
                                    borderRadius: 100,
                                    backgroundColor: '#E8788A',
                                    opacity: isLoading ? 0.8 : 1,
                                    shadowColor: '#E8788A',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 8,
                                    elevation: 6
                                }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 }}>
                                        {mode === 'join' ? 'Enter Room' : 'Create Room'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}
