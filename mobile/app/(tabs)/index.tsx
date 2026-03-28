import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { Send, Heart } from 'lucide-react-native';

interface Message {
    id: number;
    sender: 'you' | 'her';
    content: string;
    type: 'text' | 'voice' | 'image';
    createdAt: string;
}

export default function ChatScreen() {
    const { session } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const isRishika = session?.user.role === 'Rishika';

    // Fetch history
    useEffect(() => {
        if (!session) return;
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
        
        console.log('📱 Chat: Fetching history...');
        fetch(`${API_URL}/api/messages?roomId=${session.room.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.messages) setMessages(data.messages);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('📱 Chat: Fetch error', err);
                setIsLoading(false);
            });
    }, [session]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('chat:message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.off('chat:message');
        };
    }, [socket]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (!socket) {
            console.warn('📱 Chat: Cannot send message, socket is disconnected or missing');
            return;
        }
        if (!session) {
            console.warn('📱 Chat: Cannot send message, session is missing');
            return;
        }

        console.log(`📱 Chat: Emitting message "${inputText}" as ${isRishika ? 'Rishika' : 'DSP'}`);
        const senderEnum = isRishika ? 'her' : 'you';
        socket.emit('chat:message', {
            roomId: session.room.id,
            sender: senderEnum,
            content: inputText,
            type: 'text'
        });

        setInputText('');
    };

    const renderMessage = ({ item }: { item: Message }) => {
        // Map sender to local perspective
        let isMe = false;
        if (isRishika && item.sender === 'her') isMe = true;
        if (!isRishika && item.sender === 'you') isMe = true;

        return (
            <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <View 
                    style={{
                        maxWidth: '80%',
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: isMe ? '#E8788A' : '#1C2038',
                        borderTopRightRadius: isMe ? 0 : 16,
                        borderTopLeftRadius: isMe ? 16 : 0,
                        borderWidth: isMe ? 0 : 1,
                        borderColor: 'rgba(255,255,255,0.05)'
                    }}
                >
                    <Text style={{ fontSize: 14, color: isMe ? 'white' : '#EDE9F5' }}>
                        {item.content}
                    </Text>
                    <Text style={{ fontSize: 10, marginTop: 4, opacity: 0.5, color: isMe ? 'white' : '#8A8FA8' }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0B0E1A', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#F2A7C3" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={{ flex: 1, backgroundColor: '#0B0E1A' }}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 36, backgroundColor: '#141829', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Whisper something..."
                    placeholderTextColor="#8A8FA8"
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                    blurOnSubmit={false}
                    style={{ flex: 1, backgroundColor: '#1C2038', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, color: 'white' }}
                />
                <TouchableOpacity 
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: inputText.trim() ? '#E8788A' : 'rgba(255, 255, 255, 0.05)',
                        marginLeft: 12
                    }}
                >
                    <Send size={20} color={inputText.trim() ? 'white' : '#8A8FA8'} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
