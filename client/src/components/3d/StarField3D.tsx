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
            {/* Dense, tiny background white/silver stars */}
            <Stars 
                radius={80} 
                depth={50} 
                count={5000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={1} 
            />

            {/* Glowing accent particles (Pink #F2A7C3, Lavender #C4B1D4, Gold #F5D380) */}
            <Sparkles 
                count={200} 
                scale={100} 
                size={8} 
                speed={0.4} 
                opacity={0.8} 
                color="#F2A7C3" 
                noise={10} 
            />
            <Sparkles 
                count={150} 
                scale={120} 
                size={10} 
                speed={0.2} 
                opacity={0.6} 
                color="#F5D380" 
                noise={5} 
            />
            <Sparkles 
                count={250} 
                scale={150} 
                size={6} 
                speed={0.6} 
                opacity={0.7} 
                color="#C4B1D4" 
                noise={15} 
            />
        </group>
    );
};

export default StarField3D;
