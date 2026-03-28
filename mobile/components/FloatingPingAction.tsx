import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { usePathname } from 'expo-router';

export function FloatingPingAction() {
  const { session } = useAuth();
  const { socket } = useSocket();
  const pathname = usePathname();

  const handlePing = () => {
    if (!socket || !session) return;
    
    let sectionName = 'Chat';
    const path = pathname;
    
    if (path.includes('/calendar')) sectionName = 'Calendar';
    else if (path.includes('/map')) sectionName = 'Distance';
    else if (path.includes('/music')) sectionName = 'Music';
    else if (path.includes('/gallery')) sectionName = 'Our Memories';
    else if (path.includes('/games')) sectionName = 'Games';
    else if (path.includes('/surprises')) sectionName = 'Surprises';
    
    socket.emit('invite:section', {
      roomId: session.room.id,
      sender: session.user.id,
      senderRole: session.user.role,
      sectionName,
      path
    });
  };

  return (
    <TouchableOpacity
        onPress={handlePing}
        style={{
          position: 'absolute',
          bottom: 32,
          left: 24,
          backgroundColor: '#E8788A',
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#E8788A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 5,
        }}
        activeOpacity={0.8}
    >
        <Sparkles color="white" size={24} />
    </TouchableOpacity>
  );
}
