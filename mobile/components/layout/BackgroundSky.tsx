import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const NUM_STARS = 60;

const Star = ({ x, y, size, delay }: { x: number, y: number, size: number, delay: number }) => {
    const opacity = useSharedValue(Math.random() * 0.3 + 0.1);
    
    useEffect(() => {
        opacity.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(1, { duration: 2000 + Math.random() * 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.1, { duration: 2000 + Math.random() * 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: 'white',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: size,
    }));

    return <Animated.View style={style} />;
}

const NebulaCloud = ({ delay, startX, startY, endX, endY, color1, color2, size, duration }: any) => {
    const translateX = useSharedValue(startX);
    const translateY = useSharedValue(startY);
    
    useEffect(() => {
        translateX.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(endX, { duration, easing: Easing.inOut(Easing.sin) }),
                withTiming(startX, { duration, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        ));
        translateY.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(endY, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) }),
                withTiming(startY, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        width: size * 2,
        height: size * 2,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ] as any
    }));

    const gradId = useMemo(() => `grad-${color1.replace('#', '')}-${color2.replace('#', '')}`, [color1, color2]);

    return (
        <Animated.View style={style}>
            <Svg width="100%" height="100%">
                <Defs>
                    <SvgRadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor={color1} stopOpacity="0.25" />
                        <Stop offset="50%" stopColor={color2} stopOpacity="0.1" />
                        <Stop offset="100%" stopColor={color2} stopOpacity="0" />
                    </SvgRadialGradient>
                </Defs>
                <Circle cx={size} cy={size} r={size} fill={`url(#${gradId})`} />
            </Svg>
        </Animated.View>
    );
};

export default function BackgroundSky() {
    const stars = useMemo(() => Array.from({ length: NUM_STARS }).map((_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() > 0.8 ? Math.random() * 2 + 1.5 : Math.random() * 1.5 + 0.5,
        delay: Math.random() * 3000
    })), []);

    return (
        <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
                colors={['#05070D', '#0B0E1A', '#131626']}
                style={StyleSheet.absoluteFill}
            />
            {stars.map(star => (
                <Star key={star.id} x={star.x} y={star.y} size={star.size} delay={star.delay} />
            ))}
            
            {/* Top right nebula */}
            <NebulaCloud 
                delay={0}
                startX={width * 0.2} startY={-height * 0.1}
                endX={width * 0.5} endY={height * 0.05}
                color1="#C4B1D4" color2="#81B1EE"
                size={width * 0.8} duration={25000}
            />
            {/* Bottom left nebula */}
            <NebulaCloud 
                delay={2000}
                startX={-width * 0.4} startY={height * 0.5}
                endX={-width * 0.1} endY={height * 0.65}
                color1="#F2A7C3" color2="#C4B1D4"
                size={width * 0.7} duration={28000}
            />
        </Animated.View>
    );
}
