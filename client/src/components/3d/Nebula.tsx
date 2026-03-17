import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Nebula: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);

    const nebulae = useMemo(() => [
        { pos: [-12, 6, -40] as [number, number, number], color: '#F2A7C3', scale: 15, opacity: 0.03 },
        { pos: [10, -5, -50] as [number, number, number], color: '#C4B1D4', scale: 18, opacity: 0.025 },
        { pos: [-8, -8, -60] as [number, number, number], color: '#E8788A', scale: 12, opacity: 0.02 },
        { pos: [15, 8, -45] as [number, number, number], color: '#F5D380', scale: 10, opacity: 0.015 },
    ], []);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const t = clock.getElapsedTime();

        // Very slow drift
        groupRef.current.children.forEach((child, i) => {
            child.position.x += Math.sin(t * 0.02 + i) * 0.002;
            child.position.y += Math.cos(t * 0.015 + i) * 0.001;
            child.rotation.z = Math.sin(t * 0.01 + i * 0.5) * 0.02;
        });
    });

    return (
        <group ref={groupRef}>
            {nebulae.map((n, i) => (
                <mesh key={i} position={n.pos}>
                    <planeGeometry args={[n.scale, n.scale]} />
                    <meshBasicMaterial
                        color={n.color}
                        transparent
                        opacity={n.opacity}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
};

export default Nebula;
