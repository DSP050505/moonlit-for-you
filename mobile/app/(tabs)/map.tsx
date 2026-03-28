import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, ActivityIndicator, ScrollView } from 'react-native';
import { Compass } from 'lucide-react-native';
import { useLocationDistance } from '../../hooks/useLocationDistance';

export default function MapScreen() {
    const { distance, locationAccess, myLoc, partnerLoc, isRishika, partnerName } = useLocationDistance();

    // Heart animation
    const heartAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.timing(heartAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [heartAnim]);

    const translateX = heartAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Dimensions.get('window').width - 240], // Estimate route length
    });

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontFamily: 'Quicksand', color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, opacity: 0.9 }}>
                🛰️ Live Connection
            </Text>

            {/* Connection Card */}
            <View style={styles.connectionCard}>
                
                {/* Visual Route */}
                <View style={styles.routeContainer}>
                    {/* Left Node */}
                    <View style={styles.node}>
                        <Text style={styles.nodeIcon}>📍</Text>
                        <Text style={[styles.nodeText, { color: '#F2A7C3' }]}>Your Heart</Text>
                    </View>

                    {/* Connecting Line with Animated Heart */}
                    <View style={styles.line}>
                        <Animated.Text style={[styles.animatedHeart, { transform: [{ translateX }] }]}>
                            ❤️
                        </Animated.Text>
                    </View>

                    {/* Right Node */}
                    <View style={styles.node}>
                        <Text style={styles.nodeIcon}>📍</Text>
                        <Text style={[styles.nodeText, { color: '#F5D380' }]}>{partnerName}'s Heart</Text>
                    </View>
                </View>

                {/* Distance Value */}
                <View style={styles.distanceContainer}>
                    {distance !== null ? (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
                                <Text style={styles.distanceNumber}>{distance}</Text>
                                <Text style={styles.distanceUnit}>km</Text>
                            </View>
                            <Text style={styles.distanceMessage}>
                                {distance === 0 ? "You're side by side! ✨" : "Always thinking of you 💫"}
                            </Text>
                        </>
                    ) : (
                        <ActivityIndicator color="#F2A7C3" size="large" />
                    )}
                </View>

                {/* Background Grid Pattern Simulator */}
                <View style={styles.gridPattern} pointerEvents="none" />
            </View>

            {/* Detail Mini Cards */}
            <View style={styles.cardsRow}>
                <View style={styles.miniCard}>
                    <Text style={[styles.cardTitle, { color: '#E8788A' }]}>Me</Text>
                    <Text style={styles.cardCoord}>
                        {locationAccess === 'denied' ? 'Permission Denied' : myLoc ? `${myLoc.lat.toFixed(4)}, ${myLoc.lng.toFixed(4)}` : 'Locating...'}
                    </Text>
                </View>
                <View style={styles.miniCard}>
                    <Text style={[styles.cardTitle, { color: '#F5D380' }]}>{partnerName}</Text>
                    <Text style={styles.cardCoord}>
                        {partnerLoc ? `${partnerLoc.lat.toFixed(4)}, ${partnerLoc.lng.toFixed(4)}` : 'Signal waiting...'}
                    </Text>
                </View>
            </View>

            {locationAccess === 'denied' && (
                <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#E8788A' }}>
                    Please enable location access in device settings for real-time tracking!
                </Text>
            )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    connectionCard: {
        backgroundColor: 'rgba(28, 32, 56, 0.4)',
        borderRadius: 24,
        paddingVertical: 40,
        paddingHorizontal: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
        zIndex: 2,
    },
    node: {
        alignItems: 'center',
        zIndex: 2,
    },
    nodeIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    nodeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
        position: 'relative',
        transform: [{ translateY: -15 }]
    },
    animatedHeart: {
        position: 'absolute',
        top: -12,
        fontSize: 18,
    },
    distanceContainer: {
        alignItems: 'center',
        zIndex: 2,
    },
    distanceNumber: {
        fontSize: 64,
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: -1,
    },
    distanceUnit: {
        fontSize: 24,
        color: '#F2A7C3',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    distanceMessage: {
        fontFamily: 'Caveat',
        color: '#C4B1D4',
        fontSize: 22,
        marginTop: 8,
    },
    gridPattern: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.03,
        backgroundColor: 'transparent',
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    miniCard: {
        flex: 1,
        backgroundColor: 'rgba(28, 32, 56, 0.5)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: 6,
        fontSize: 15,
    },
    cardCoord: {
        fontSize: 12,
        color: '#8A8FA8',
        fontVariant: ['tabular-nums']
    }
});
