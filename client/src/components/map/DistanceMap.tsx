import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../shared/Card';
import Globe3D from '../3d/Globe3D';
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

// Default fallback coordinates if neither shares location
const DEFAULT_LOCATIONS = {
    DSP: { lat: 17.385, lng: 78.4867, city: 'Hyderabad' },
    Rishika: { lat: 28.6139, lng: 77.209, city: 'Delhi' }
};

const DistanceMap: React.FC = () => {
    const { session } = useAuth();
    const { socket } = useSocket();

    const [locationAccess, setLocationAccess] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [partnerLoc, setPartnerLoc] = useState<{ lat: number; lng: number } | null>(null);

    const isRishika = session?.user.role === 'Rishika';
    const partnerName = isRishika ? 'Devi Sri Prasad' : 'Rishika';

    // Set up live geolocation watch
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationAccess('denied');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocationAccess('granted');
                const crd = position.coords;
                setMyLoc({ lat: crd.latitude, lng: crd.longitude });

                // Emit live location via socket
                if (socket && session) {
                    socket.emit('location:update', {
                        roomId: session.room.id,
                        userId: session.user.id,
                        lat: crd.latitude,
                        lng: crd.longitude
                    });
                }
            },
            (error) => {
                console.error("Error watching location:", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationAccess('denied');
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [socket, session]);

    // Listen for partner's location updates
    useEffect(() => {
        if (!socket) return;

        const onPartnerLocation = (data: any) => {
            // Check if it's the other user in the room
            if (data.userId !== session?.user.id) {
                setPartnerLoc({ lat: data.lat, lng: data.lng });
            }
        };

        socket.on('location:updated', onPartnerLocation);
        return () => {
            socket.off('location:updated', onPartnerLocation);
        };
    }, [socket, session]);

    // Compute the displayed active coordinates
    const activeMyLoc = myLoc || (isRishika ? DEFAULT_LOCATIONS.Rishika : DEFAULT_LOCATIONS.DSP);
    const activePartnerLoc = partnerLoc || (isRishika ? DEFAULT_LOCATIONS.DSP : DEFAULT_LOCATIONS.Rishika);

    const distance = getDistance(activeMyLoc.lat, activeMyLoc.lng, activePartnerLoc.lat, activePartnerLoc.lng);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: 'var(--space-4)',
            }}
            className="map-container"
        >
            <h2 style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: 'var(--space-6)',
            }}>
                🗺️ Our Little World
            </h2>

            {/* Access Denied Warning */}
            {locationAccess === 'denied' && (
                <div style={{
                    padding: '12px',
                    background: 'rgba(232, 120, 138, 0.1)',
                    border: '1px solid rgba(232, 120, 138, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--accent-rose)',
                    textAlign: 'center',
                    marginBottom: 'var(--space-4)',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ You denied location access. The map is showing a default distance. Please allow location access for real-time tracking!
                </div>
            )}

            {!partnerLoc && (
                <div style={{
                    padding: '12px',
                    background: 'rgba(245, 211, 128, 0.1)',
                    border: '1px solid rgba(245, 211, 128, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--accent-gold)',
                    textAlign: 'center',
                    marginBottom: 'var(--space-4)',
                    fontSize: '0.9rem'
                }}>
                    🛰️ Waiting for {partnerName} to share their live location...
                </div>
            )}

            {/* 3D Interactive Globe */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{ marginBottom: 'var(--space-6)' }}
            >
                <Globe3D
                    city1={{ lat: activeMyLoc.lat, lng: activeMyLoc.lng, name: 'You' }}
                    city2={{ lat: activePartnerLoc.lat, lng: activePartnerLoc.lng, name: partnerName }}
                />
            </motion.div>

            {/* Distance Banner */}
            <Card glow hover3D={false}>
                <div style={{
                    padding: 'var(--space-8)',
                    textAlign: 'center',
                }}>
                    {/* Animated Heart Line */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-4)',
                    }}>
                        <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '2rem' }}
                        >
                            📍
                        </motion.span>

                        {/* Dashed line with animated heart */}
                        <div style={{
                            flex: 1,
                            maxWidth: '300px',
                            height: '2px',
                            background: 'repeating-linear-gradient(90deg, var(--accent-pink) 0px, var(--accent-pink) 8px, transparent 8px, transparent 16px)',
                            position: 'relative',
                        }}>
                            <motion.span
                                animate={{ x: [-20, 280, -20] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    fontSize: '1.2rem',
                                }}
                            >
                                💗
                            </motion.span>
                        </div>

                        <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                            style={{ fontSize: '2rem' }}
                        >
                            📍
                        </motion.span>
                    </div>

                    {/* Distance Text */}
                    <motion.h1
                        className="distance-text"
                        animate={{ textShadow: ['0 0 10px rgba(245,211,128,0.3)', '0 0 20px rgba(245,211,128,0.5)', '0 0 10px rgba(245,211,128,0.3)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '3rem',
                            color: 'var(--accent-gold)',
                            margin: 0,
                        }}
                    >
                        {distance} km
                    </motion.h1>
                    <p style={{
                        fontFamily: 'var(--font-handwriting)',
                        color: 'var(--accent-pink)',
                        fontSize: '1.1rem',
                        marginTop: 'var(--space-2)',
                    }}>
                        ...but love knows no distance 💕
                    </p>
                </div>
            </Card>

            {/* City Cards */}
            <div className="city-cards-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-6)',
            }}>
                {/* Your City */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card hover3D>
                        <div style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--accent-rose)',
                                fontSize: '1.2rem',
                                marginBottom: '4px'
                            }}>
                                You
                            </h3>
                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)'
                            }}>
                                Lat: {activeMyLoc.lat.toFixed(4)}<br />
                                Lng: {activeMyLoc.lng.toFixed(4)}
                            </p>
                            <p style={{
                                fontFamily: 'var(--font-handwriting)',
                                color: 'var(--accent-lavender)',
                                fontSize: '0.9rem',
                                marginTop: 'var(--space-3)',
                                fontStyle: 'italic',
                            }}>
                                "Looking at the same sky as you"
                            </p>
                        </div>
                    </Card>
                </motion.div>

                {/* Partner City */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card hover3D>
                        <div style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--accent-pink)',
                                fontSize: '1.2rem',
                                marginBottom: '4px'
                            }}>
                                {partnerName} 💕
                            </h3>
                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)'
                            }}>
                                {partnerLoc ? (
                                    <>
                                        Lat: {activePartnerLoc.lat.toFixed(4)}<br />
                                        Lng: {activePartnerLoc.lng.toFixed(4)}
                                    </>
                                ) : (
                                    <span>Waiting for location...</span>
                                )}
                            </p>
                            <p style={{
                                fontFamily: 'var(--font-handwriting)',
                                color: 'var(--accent-lavender)',
                                fontSize: '0.9rem',
                                marginTop: 'var(--space-3)',
                                fontStyle: 'italic',
                            }}>
                                "My absolute favorite place"
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DistanceMap;
