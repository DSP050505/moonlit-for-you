import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MessageSquare, Calendar, MapPin, Music, LogOut, Menu, Image as ImageIcon, Gamepad2, Gift } from 'lucide-react-native';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, usePathname } from 'expo-router';
import { useLocationDistance } from '../../hooks/useLocationDistance';
import { useSocket } from '../../hooks/useSocket';
import { Sparkles } from 'lucide-react-native';

function CustomDrawerContent(props: any) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleExitRoom = () => {
    Alert.alert(
      "Exit Room",
      "Are you sure you want to leave this private sky?",
      [
        { text: "Stay", style: "cancel" },
        { 
          text: "Exit", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
      <DrawerContentScrollView {...props}>
        <View style={{ padding: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
          <Text style={{ fontFamily: 'Caveat', color: 'white', fontSize: 24 }}>BetweenUs</Text>
          <Text style={{ color: '#8A8FA8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Our Private Sky</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
        <TouchableOpacity 
          onPress={handleExitRoom}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
        >
          <LogOut size={20} color="#E8788A" />
          <Text style={{ color: '#E8788A', marginLeft: 15, fontWeight: '600' }}>Exit Room</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HeaderPingButton() {
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
    <TouchableOpacity onPress={handlePing} style={{ marginLeft: 15 }}>
      <Sparkles size={24} color="#E8788A" />
    </TouchableOpacity>
  );
}

export default function SidebarLayout() {
  const { distance } = useLocationDistance();

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerStyle: {
          backgroundColor: '#0B0E1A',
          width: 280,
        },
        drawerActiveTintColor: '#F2A7C3',
        drawerInactiveTintColor: '#8A8FA8',
        drawerLabelStyle: {
          marginLeft: -10,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#0B0E1A',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        },
        headerTitleStyle: {
          fontFamily: 'Quicksand',
          color: '#EDE9F5',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerLeft: () => <HeaderPingButton />,
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.toggleDrawer()}
            style={{ marginRight: 15 }}
          >
            <Menu size={24} color="#EDE9F5" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Chat',
          title: 'Whisper',
          drawerIcon: ({ color }) => <MessageSquare size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          drawerLabel: 'Calendar',
          title: 'Moments',
          drawerIcon: ({ color }) => <Calendar size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="map"
        options={{
          drawerLabel: ({ color }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: -10 }}>
              <Text style={{ color, fontWeight: '600' }}>Distance</Text>
              {distance !== null && (
                <Text style={{ color: color === '#F2A7C3' ? '#F2A7C3' : '#8A8FA8', fontSize: 13, marginRight: 16 }}>
                  {distance} km
                </Text>
              )}
            </View>
          ),
          title: 'Distance',
          drawerIcon: ({ color }) => <MapPin size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="music/index"
        options={{
          drawerLabel: 'Music',
          title: 'Our Music',
          drawerIcon: ({ color }) => <Music size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="gallery/index"
        options={{
          drawerLabel: 'Gallery',
          title: 'Our Memories',
          drawerIcon: ({ color }) => <ImageIcon size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="games/index"
        options={{
          drawerLabel: 'Games',
          title: 'Play Together',
          drawerIcon: ({ color }) => <Gamepad2 size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="surprises/index"
        options={{
          drawerLabel: 'Surprises',
          title: 'Surprises',
          drawerIcon: ({ color }) => <Gift size={20} color={color} />,
        }}
      />
      {/* Hide Hub and Letters from drawer but keep files to avoid route errors */}
      <Drawer.Screen
        name="hub"
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="letters/index"
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
   </View>
  );
}

