import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CallData {
    senderRole: string;
    sectionName: string;
    path: string;
}

export function GlobalCallNotification() {
    const { socket } = useSocket();
    const { session } = useAuth();
    const router = useRouter();
    const [callData, setCallData] = useState<CallData | null>(null);
    const slideAnim = useRef(new Animated.Value(200)).current;

    const dismissCurrent = () => {
        Animated.timing(slideAnim, {
            toValue: 200,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setCallData(null);
        });
    };

    useEffect(() => {
        if (!socket || !session) return;

        const handleCall = (data: CallData) => {
            if (data.senderRole !== session.user.role) {
                setCallData(data);
                
                // Reset to off-screen first, just in case
                slideAnim.setValue(200);

                // Slide up from bottom
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7
                }).start();

                // Auto-dismiss after 6 seconds
                setTimeout(() => {
                    dismissCurrent();
                }, 6000);
            }
        };

        socket.on('invite:section', handleCall);

        return () => {
            socket.off('invite:section', handleCall);
        };
    }, [socket, session, slideAnim]);

    const handleAccept = () => {
        if (callData?.path) {
            router.push(callData.path as any);
            dismissCurrent();
        }
    };

    if (!callData) return null;

    return (
        <Animated.View style={{
            position: 'absolute',
            bottom: 40,
            left: 20,
            right: 20,
            transform: [{ translateY: slideAnim }],
            zIndex: 99999,
        }}>
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={handleAccept}
                style={{
                    backgroundColor: 'rgba(232, 120, 138, 0.95)',
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: '#E8788A',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, marginRight: 16 }}>
                        <Sparkles size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                            {callData.senderRole === 'DSP' ? 'Devi Sri Prasad' : 'Rishika'} is calling
                        </Text>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                            Come to {callData.sectionName}! ✨
                        </Text>
                    </View>
                </View>
                <ArrowRight size={20} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );
}
