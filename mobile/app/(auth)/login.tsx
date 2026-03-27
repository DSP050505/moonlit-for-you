import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { motion, AnimatePresence } from 'framer-motion'; // Framer motion doesn't work well in RN, using standard RN View for now or Moti if needed. 
// For now, I'll use standard RN components with Tailwind (NativeWind)
import { useAuth, Role } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginScreen() {
    const { login } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'join' | 'create'>('join');
    const [roomName, setRoomName] = useState('');
    const [passcode, setPasscode] = useState('');
    const [role, setRole] = useState<Role>('Rishika');
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

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            console.log('📱 Login: Response received', data);

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (mode === 'create') {
                // Auto-join after create
                const joinRes = await fetch(`${API_URL}/api/auth/join-room`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: roomName, passcode, role }),
                });
                const joinData = await joinRes.json();
                if (!joinRes.ok) throw new Error(joinData.error);
                await login({ room: joinData.room, user: joinData.user });
            } else {
                await login({ room: data.room, user: data.user });
            }
            
            console.log('📱 Login: Success');
            router.replace('/(tabs)/chat');
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
            className="flex-1 bg-[#0B0E1A]"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-12 justify-center">
                <View className="items-center mb-10">
                    <Text className="text-white text-6xl font-bold mb-2" style={{ fontFamily: 'Caveat' }}>
                        BetweenUs
                    </Text>
                    <Text className="text-[#8A8FA8] uppercase tracking-[3px] text-xs">
                        Enter our private sky
                    </Text>
                </View>

                <View className="bg-[#141829]/50 border border-white/10 rounded-[40px] p-8 shadow-2xl">
                    <View className="flex-row bg-white/5 rounded-full p-1 mb-6">
                        <TouchableOpacity 
                            onPress={() => setMode('join')}
                            className={`flex-1 py-3 rounded-full ${mode === 'join' ? 'bg-white/10' : ''}`}
                        >
                            <Text className={`text-center font-semibold ${mode === 'join' ? 'text-white' : 'text-white/40'}`}>
                                Join Room
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setMode('create')}
                            className={`flex-1 py-3 rounded-full ${mode === 'create' ? 'bg-white/10' : ''}`}
                        >
                            <Text className={`text-center font-semibold ${mode === 'create' ? 'text-white' : 'text-white/40'}`}>
                                Create Room
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-white/40 text-xs uppercase tracking-widest mb-2 ml-1">Room Name</Text>
                            <TextInput
                                value={roomName}
                                onChangeText={setRoomName}
                                placeholder="e.g. OurLittleWorld"
                                placeholderTextColor="#444"
                                className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-base"
                                autoCapitalize="none"
                            />
                        </View>

                        <View>
                            <Text className="text-white/40 text-xs uppercase tracking-widest mb-2 ml-1">Passcode</Text>
                            <TextInput
                                value={passcode}
                                onChangeText={setPasscode}
                                placeholder="Secret key..."
                                placeholderTextColor="#444"
                                className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-base"
                                secureTextEntry
                            />
                        </View>

                        <View>
                            <Text className="text-white/40 text-xs uppercase tracking-widest mb-2 ml-1">I am...</Text>
                            <View className="flex-row space-x-3">
                                <TouchableOpacity 
                                    onPress={() => setRole('Rishika')}
                                    className={`flex-1 py-4 border rounded-lg ${role === 'Rishika' ? 'border-pink/40 bg-pink/5' : 'border-white/10 bg-black/20'}`}
                                >
                                    <Text className={`text-center ${role === 'Rishika' ? 'text-white' : 'text-white/30'}`}>Rishika</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setRole('DSP')}
                                    className={`flex-1 py-4 border rounded-lg ${role === 'DSP' ? 'border-pink/40 bg-pink/5' : 'border-white/10 bg-black/20'}`}
                                >
                                    <Text className={`text-center ${role === 'DSP' ? 'text-white' : 'text-white/30'}`}>DSP</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {error ? <Text className="text-rose text-center text-sm">{error}</Text> : null}

                        <TouchableOpacity 
                            onPress={handleSubmit}
                            disabled={isLoading}
                            className={`mt-4 py-4 rounded-3xl bg-rose shadow-lg shadow-rose/30 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg tracking-wider">
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
