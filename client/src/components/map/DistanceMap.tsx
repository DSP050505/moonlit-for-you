import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../shared/Card';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/useSocket';

// Approximate distance calculation (Haversine formula)
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

// Default fallback coordinates
const DEFAULT_LOCATIONS = {
    Romeo: { lat: 17.385, lng: 78.4867, city: 'Hyderabad' },
    Juliet: { lat: 28.6139, lng: 77.209, city: 'Delhi' }
};

const DistanceMap: React.FC = () => {
    const { session } = useAuth();
    const { socket } = useSocket();

    const [locationAccess, setLocationAccess] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [partnerLoc, setPartnerLoc] = useState<{ lat: number; lng: number } | null>(null);

    const isJuliet = session?.user.role === 'Juliet';
    const partnerName = isJuliet ? 'Romeo' : 'Juliet';

    // Set up live geolocation watch
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationAccess('denied');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocationAccess('granted');
                setMyLoc({ lat: position.coords.latitude, lng: position.coords.longitude });

                if (socket && session) {
                    socket.emit('location:update', {
                        roomId: session.room.id,
                        userId: session.user.id,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) setLocationAccess('denied');
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [socket, session]);

    // Listen for partner's location updates
    useEffect(() => {
        if (!socket) return;
        const onPartnerLocation = (data: any) => {
            if (data.userId !== session?.user.id) {
                setPartnerLoc({ lat: data.lat, lng: data.lng });
            }
        };
        socket.on('location:updated', onPartnerLocation);
        return () => {
             socket.off('location:updated', onPartnerLocation);
        };
    }, [socket, session]);

    const activeMyLoc = myLoc || (isJuliet ? DEFAULT_LOCATIONS.Juliet : DEFAULT_LOCATIONS.Romeo);
    const activePartnerLoc = partnerLoc || (isJuliet ? DEFAULT_LOCATIONS.Romeo : DEFAULT_LOCATIONS.Juliet);
    const distance = getDistance(activeMyLoc.lat, activeMyLoc.lng, activePartnerLoc.lat, activePartnerLoc.lng);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: 'var(--space-4)',
            }}
        >
            <h2 style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: 'var(--space-8)',
                fontSize: '1.5rem',
                opacity: 0.9
            }}>
                🛰️ Live Connection
            </h2>

            {/* Simple Connection Card */}
            <div style={{
                background: 'rgba(28, 32, 56, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: 'var(--space-10) var(--space-6)',
                marginBottom: 'var(--space-6)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Visual Route */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: '500px',
                    margin: '0 auto var(--space-8) auto',
                    position: 'relative',
                }}>
                    {/* Left Node */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📍</div>
                        <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-pink)', fontSize: '0.9rem', fontWeight: 600 }}>Your Heart</div>
                    </div>

                    {/* Connecting Line */}
                    <div style={{
                        flex: 1,
                        height: '2px',
                        background: 'rgba(255,255,255,0.1)',
                        margin: '0 20px',
                        position: 'relative',
                        transform: 'translateY(-15px)'
                    }}>
                        <motion.div
                            animate={{ left: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                fontSize: '1.2rem',
                            }}
                        >
                            ❤️
                        </motion.div>
                    </div>

                    {/* Right Node */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📍</div>
                        <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 600 }}>{partnerName}'s Heart</div>
                    </div>
                </div>

                {/* Distance Value */}
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    style={{ position: 'relative', zIndex: 2 }}
                >
                    <h1 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '4.5rem',
                        color: 'var(--text-primary)',
                        margin: 0,
                        fontWeight: 700,
                        letterSpacing: '-2px'
                    }}>
                        {distance}<span style={{ fontSize: '1.5rem', color: 'var(--accent-pink)', marginLeft: '8px' }}>km</span>
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-handwriting)',
                        color: 'var(--accent-lavender)',
                        fontSize: '1.2rem',
                        marginTop: 'var(--space-2)'
                    }}>
                        {distance === 0 ? "You're side by side! ✨" : "Always thinking of you 💫"}
                    </p>
                </motion.div>

                {/* Subtle Map-like Grid Pattern Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Detail Mini Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-4)',
            }}>
                <Card glow={false}>
                    <div style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-rose)', fontWeight: 600, marginBottom: '4px' }}>Me</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {activeMyLoc.lat.toFixed(4)}, {activeMyLoc.lng.toFixed(4)}
                        </div>
                    </div>
                </Card>
                <Card glow={false}>
                    <div style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '4px' }}>{partnerName}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {partnerLoc ? `${activePartnerLoc.lat.toFixed(4)}, ${activePartnerLoc.lng.toFixed(4)}` : "Signal waiting..."}
                        </div>
                    </div>
                </Card>
            </div>
            
            {locationAccess === 'denied' && (
                <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: '0.8rem', color: 'var(--accent-rose)' }}>
                    Please enable location access for real-time tracking!
                </p>
            )}
        </motion.div>
    );
};

export default DistanceMap;
