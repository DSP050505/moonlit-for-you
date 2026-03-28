import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

const DEFAULT_LOCATIONS = {
    Romeo: { lat: 17.385, lng: 78.4867, city: 'Hyderabad' },
    Juliet: { lat: 28.6139, lng: 77.209, city: 'Delhi' }
};

// Approximate distance calculation (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

export function useLocationDistance() {
    const { session } = useAuth();
    const { socket } = useSocket();

    const [locationAccess, setLocationAccess] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [partnerLoc, setPartnerLoc] = useState<{ lat: number; lng: number } | null>(null);

    const isJuliet = session?.user.role === 'Juliet';

    // Set up live geolocation watch
    useEffect(() => {
        let watchSubscription: Location.LocationSubscription | null = null;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationAccess('denied');
                return;
            }
            setLocationAccess('granted');

            watchSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (location) => {
                    const lat = location.coords.latitude;
                    const lng = location.coords.longitude;
                    setMyLoc({ lat, lng });

                    if (socket && session) {
                        socket.emit('location:update', {
                            roomId: session.room.id,
                            userId: session.user.id,
                            lat,
                            lng,
                            role: session.user.role // ensure backward capability with existing listener pattern if any
                        });
                    }
                }
            );
        })();

        return () => {
            if (watchSubscription) watchSubscription.remove();
        };
    }, [socket, session]);

    // Listen for partner's location updates
    useEffect(() => {
        if (!socket) return;
        
        // Listen to "location:updated" matching the web app implementation logic
        // Also handling "location:update" just in case the backend broadcasts it exactly as is
        const onPartnerLocation = (data: any) => {
            // Validate the user id isn't ours, or the role isn't ours
            if (data.userId && data.userId !== session?.user.id) {
                setPartnerLoc({ lat: data.lat || data.latitude, lng: data.lng || data.longitude });
            } else if (data.role && data.role !== session?.user.role) {
                setPartnerLoc({ lat: data.lat || data.latitude, lng: data.lng || data.longitude });
            }
        };

        socket.on('location:updated', onPartnerLocation);
        socket.on('location:update', onPartnerLocation); // For fallback compatibility

        return () => {
            socket.off('location:updated', onPartnerLocation);
            socket.off('location:update', onPartnerLocation);
        };
    }, [socket, session]);

    const activeMyLoc = myLoc || (isJuliet ? { lat: DEFAULT_LOCATIONS.Juliet.lat, lng: DEFAULT_LOCATIONS.Juliet.lng } : { lat: DEFAULT_LOCATIONS.Romeo.lat, lng: DEFAULT_LOCATIONS.Romeo.lng });
    const activePartnerLoc = partnerLoc || (isJuliet ? { lat: DEFAULT_LOCATIONS.Romeo.lat, lng: DEFAULT_LOCATIONS.Romeo.lng } : { lat: DEFAULT_LOCATIONS.Juliet.lat, lng: DEFAULT_LOCATIONS.Juliet.lng });
    
    const distance = calculateDistance(activeMyLoc.lat, activeMyLoc.lng, activePartnerLoc.lat, activePartnerLoc.lng);

    return {
        distance,
        locationAccess,
        myLoc: activeMyLoc,
        partnerLoc: activePartnerLoc,
        isJuliet,
        partnerName: isJuliet ? 'Romeo' : 'Juliet'
    };
}
