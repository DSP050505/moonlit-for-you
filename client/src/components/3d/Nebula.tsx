import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Clouds } from '@react-three/drei';
import * as THREE from 'three';

const Nebula: React.FC = () => {
    const cloudsRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!cloudsRef.current) return;
        // Extremely slow drift
        cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    });

    return (
        <group ref={cloudsRef} position={[0, -5, -40]}>
            <Clouds material={THREE.MeshBasicMaterial} limit={400} range={100}>
                {/* Lavender / Purple nebulous regions moved to sides */}
                <Cloud speed={0.2} opacity={0.25} color="#C4B1D4" scale={2} volume={10} position={[-45, 10, -10]} />
                <Cloud speed={0.2} opacity={0.2} color="#81B1EE" scale={3} volume={15} position={[45, -10, -20]} />
                
                {/* Deep Pinkish hues moved to sides */}
                <Cloud speed={0.25} opacity={0.15} color="#F2A7C3" scale={2.5} volume={12} position={[-35, 20, -15]} />
                <Cloud speed={0.25} opacity={0.15} color="#F2A7C3" scale={2.5} volume={12} position={[35, -20, -15]} />
                
                {/* Dark fog layer to blend with sky background */}
                <Cloud speed={0.1} opacity={0.3} color="#0B0E1A" scale={5} volume={20} position={[0, -30, -30]} />
            </Clouds>
        </group>
    );
};

export default Nebula;
