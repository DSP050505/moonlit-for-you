import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const StarField3D: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const time = clock.getElapsedTime();
        // Slow majestic rotation of the entire starfield
        groupRef.current.rotation.y = time * 0.02;
        groupRef.current.rotation.x = Math.sin(time * 0.01) * 0.05;
    });

    return (
        <group ref={groupRef}>
            {/* Minimal, elegant white/silver stars */ }
            <Stars 
                radius={80} 
                depth={50} 
                count={1200} 
                factor={3} 
                saturation={0} 
                fade 
                speed={0.5} 
            />

            {/* Subtle, glowing accent particles (Pink #F2A7C3, Lavender #C4B1D4, Gold #F5D380) */}
            <Sparkles 
                count={50} 
                scale={100} 
                size={8} 
                speed={0.2} 
                opacity={0.3} 
                color="#F2A7C3" 
                noise={5} 
            />
            <Sparkles 
                count={40} 
                scale={120} 
                size={10} 
                speed={0.1} 
                opacity={0.25} 
                color="#F5D380" 
                noise={3} 
            />
            <Sparkles 
                count={60} 
                scale={150} 
                size={6} 
                speed={0.3} 
                opacity={0.3} 
                color="#C4B1D4" 
                noise={8} 
            />
        </group>
    );
};

export default StarField3D;
