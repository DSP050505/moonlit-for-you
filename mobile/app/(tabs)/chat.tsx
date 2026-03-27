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
        if (!inputText.trim() || !socket || !session) return;

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
            <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isMe ? 'bg-rose rounded-tr-none' : 'bg-surface rounded-tl-none border border-white/5'
                    }`}
                >
                    <Text className={`text-sm ${isMe ? 'text-white' : 'text-textDefault'}`}>
                        {item.content}
                    </Text>
                    <Text className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-white' : 'text-muted'}`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-primary justify-center items-center">
                <ActivityIndicator color="#F2A7C3" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            className="flex-1 bg-primary"
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View className="p-4 bg-secondary border-t border-white/5 flex-row items-center space-x-3">
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Whisper something..."
                    placeholderTextColor="#8A8FA8"
                    className="flex-1 bg-surface border border-white/10 rounded-full px-5 py-3 text-white"
                />
                <TouchableOpacity 
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                    className={`w-12 h-12 rounded-full justify-center items-center ${
                        inputText.trim() ? 'bg-rose' : 'bg-white/5'
                    }`}
                >
                    <Send size={20} color={inputText.trim() ? 'white' : '#8A8FA8'} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
