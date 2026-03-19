import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Clouds } from '@react-three/drei';
import * as THREE from 'three';

const Nebula: React.FC = () => {
    const cloudsRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!cloudsRef.current) return;
        const t = clock.getElapsedTime();
        // Faster drift across the screen
        cloudsRef.current.position.x = Math.sin(t * 0.06) * 3;
        cloudsRef.current.position.y = Math.cos(t * 0.04) * 2;
    });

    return (
        <group ref={cloudsRef} position={[0, 0, -35]}>
            <Clouds material={THREE.MeshBasicMaterial} limit={100} range={60}>
                {/* Top-left wispy cloud — smaller */}
                <Cloud speed={0.1} opacity={0.04} color="#C4B1D4" scale={1.5} volume={6} position={[-20, 10, -15]} segments={12} />
                {/* Bottom-right wispy cloud */}
                <Cloud speed={0.1} opacity={0.04} color="#81B1EE" scale={2.0} volume={9} position={[18, -8, -18]} segments={11} />
            </Clouds>
        </group>
    );
};

export default Nebula;
