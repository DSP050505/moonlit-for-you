import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { usePathname } from 'expo-router';
import { Send, Heart } from 'lucide-react-native';
import { useMusic } from '../../hooks/useMusic';

interface Message {
    id: number;
    sender: 'you' | 'her';
    content: string;
    type: 'text' | 'voice' | 'image';
    readAt?: string;
    createdAt: string;
}

export default function ChatScreen() {
    const { session } = useAuth();
    const { socket } = useSocket();
    const pathname = usePathname();
    const { currentTrack } = useMusic();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [onlineCount, setOnlineCount] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const isRishika = session?.user.role === 'Rishika';

    // Mark as read and join chat presence when focused
    useEffect(() => {
        if (pathname === '/' && socket && session) {
            socket.emit('chat:read', { roomId: session.room.id, sender: isRishika ? 'her' : 'you' });
            socket.emit('chat:join', { roomId: session.room.id, sender: isRishika ? 'her' : 'you' });
        }
        
        return () => {
            if (pathname === '/' && socket && session) {
                socket.emit('chat:leave', { roomId: session.room.id, sender: isRishika ? 'her' : 'you' });
            }
        };
    }, [pathname, socket, session]);

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
                
                // Once loaded, mark all messages from partner as read
                if (socket && session) {
                    socket.emit('chat:read', { roomId: session.room.id, sender: isRishika ? 'her' : 'you' });
                }
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
            // If message is from partner, mark all as read automatically
            const partnerSender = isRishika ? 'you' : 'her';
            if (msg.sender === partnerSender && session) {
                socket.emit('chat:read', { roomId: session.room.id, sender: isRishika ? 'her' : 'you' });
            }
        });

        socket.on('chat:read', (data: { reader: string }) => {
            const partnerReader = data.reader; // 'her' or 'you'
            const isMeReading = (isRishika && partnerReader === 'her') || (!isRishika && partnerReader === 'you');
            
            if (!isMeReading) {
                // The partner read my messages! Update local state to reflect this
                setMessages(prev => prev.map(m => {
                    // Map local perspective
                    const isMessageFromMe = (isRishika && m.sender === 'her') || (!isRishika && m.sender === 'you');
                    if (isMessageFromMe && !m.readAt) {
                        return { ...m, readAt: new Date().toISOString() };
                    }
                    return m;
                }));
            }
        });

        socket.on('chat:online_count', (data: { count: number }) => {
            setOnlineCount(data.count);
        });

        return () => {
            socket.off('chat:message');
            socket.off('chat:read');
            socket.off('chat:online_count');
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
                        backgroundColor: isMe ? (item.readAt ? '#E8788A' : 'rgba(232, 120, 138, 0.2)') : '#1C2038',
                        borderTopRightRadius: isMe ? 0 : 16,
                        borderTopLeftRadius: isMe ? 16 : 0,
                        borderWidth: isMe ? (item.readAt ? 0 : 1) : 1,
                        borderColor: isMe ? (item.readAt ? 'transparent' : '#E8788A') : 'rgba(255,255,255,0.05)'
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

    const sendEmoji = (emoji: string) => {
        if (!socket || !session) return;
        
        socket.emit('chat:message', {
            roomId: session.room.id,
            sender: isRishika ? 'her' : 'you',
            content: emoji,
            type: 'text'
        });
    };

    const renderHeader = () => {
        if (onlineCount < 2) return null;
        return (
            <View style={{ alignItems: 'center', paddingVertical: 8, marginBottom: 8 }}>
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(126, 207, 160, 0.1)', 
                    paddingHorizontal: 12, 
                    paddingVertical: 4, 
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: 'rgba(126, 207, 160, 0.2)'
                }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#7ECFA0', marginRight: 6 }} />
                    <Text style={{ color: '#7ECFA0', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 }}>BOTH ONLINE ✨</Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? (currentTrack ? 140 : 90) : 0}
            style={{ flex: 1, backgroundColor: '#0B0E1A' }}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={{ backgroundColor: '#141829', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                {/* ── Quick Emojis ── */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, paddingTop: 10, paddingBottom: 6 }}>
                    {['❤️', '💔', '😊', '😭', '😘', '😡', '🥺'].map(emoji => (
                        <TouchableOpacity key={emoji} onPress={() => sendEmoji(emoji)} activeOpacity={0.7}>
                            <Text style={{ fontSize: 24 }}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Input Bar ── */}
                <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: currentTrack ? 10 : (Platform.OS === 'ios' ? 32 : 36), flexDirection: 'row', alignItems: 'center' }}>
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
            </View>
        </KeyboardAvoidingView>
    );
}
