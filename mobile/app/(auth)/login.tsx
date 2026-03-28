import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#0B0E1A' }}
        >
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 48 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ color: 'white', fontSize: 48, fontWeight: 'bold', marginBottom: 8, fontFamily: 'Caveat', textAlign: 'center' }}>
                        BetweenUs
                    </Text>
                    <Text style={{ color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: 3, fontSize: 12, textAlign: 'center' }}>
                        Enter our private sky
                    </Text>
                </View>

                <View style={{ backgroundColor: 'rgba(20, 24, 41, 0.5)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 40, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}>
                    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 999, padding: 4, marginBottom: 24 }}>
                        <TouchableOpacity 
                            onPress={() => setMode('join')}
                            style={{ flex: 1, paddingVertical: 12, borderRadius: 999, backgroundColor: mode === 'join' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        >
                            <Text style={{ textAlign: 'center', fontWeight: '600', color: mode === 'join' ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                Join Room
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setMode('create')}
                            style={{ flex: 1, paddingVertical: 12, borderRadius: 999, backgroundColor: mode === 'create' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        >
                            <Text style={{ textAlign: 'center', fontWeight: '600', color: mode === 'create' ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                Create Room
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ gap: 16 }}>
                        <View>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, marginLeft: 4 }}>Room Name</Text>
                            <TextInput
                                value={roomName}
                                onChangeText={setRoomName}
                                placeholder="e.g. OurLittleWorld"
                                placeholderTextColor="#444"
                                style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, color: 'white', fontSize: 16 }}
                                autoCapitalize="none"
                            />
                        </View>

                        <View>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, marginLeft: 4 }}>Passcode</Text>
                            <TextInput
                                value={passcode}
                                onChangeText={setPasscode}
                                placeholder="Secret key..."
                                placeholderTextColor="#444"
                                style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, color: 'white', fontSize: 16 }}
                                secureTextEntry
                            />
                        </View>

                        <View>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, marginBottom: 8, marginLeft: 4 }}>I am...</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity 
                                    onPress={() => setRole('Juliet')}
                                    style={{ flex: 1, paddingVertical: 16, borderWidth: 1, borderRadius: 8, borderColor: role === 'Juliet' ? 'rgba(242, 167, 195, 0.4)' : 'rgba(255,255,255,0.1)', backgroundColor: role === 'Juliet' ? 'rgba(242, 167, 195, 0.05)' : 'rgba(0,0,0,0.2)' }}
                                >
                                    <Text style={{ textAlign: 'center', color: role === 'Juliet' ? 'white' : 'rgba(255,255,255,0.3)' }}>Juliet</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setRole('Romeo')}
                                    style={{ flex: 1, paddingVertical: 16, borderWidth: 1, borderRadius: 8, borderColor: role === 'Romeo' ? 'rgba(242, 167, 195, 0.4)' : 'rgba(255,255,255,0.1)', backgroundColor: role === 'Romeo' ? 'rgba(242, 167, 195, 0.05)' : 'rgba(0,0,0,0.2)' }}
                                >
                                    <Text style={{ textAlign: 'center', color: role === 'Romeo' ? 'white' : 'rgba(255,255,255,0.3)' }}>Romeo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {error ? <Text style={{ color: '#E8788A', textAlign: 'center', fontSize: 14 }}>{error}</Text> : null}

                        <TouchableOpacity 
                            onPress={handleSubmit}
                            disabled={isLoading}
                            style={{ 
                                marginTop: 16, 
                                paddingVertical: 16, 
                                borderRadius: 100, 
                                backgroundColor: '#E8788A',
                                opacity: isLoading ? 0.7 : 1,
                                shadowColor: '#E8788A',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                                elevation: 5
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18, letterSpacing: 1.5 }}>
                                    {mode === 'join' ? 'Enter Room' : 'Create & Enter'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
