import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Moon3D: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    // Crescent moon shape via custom geometry
    const moonGeo = useMemo(() => {
        const shape = new THREE.Shape();
        // Full circle
        const r = 1.2;
        shape.absarc(0, 0, r, 0, Math.PI * 2, false);
        // Cut out offset circle for crescent
        const hole = new THREE.Path();
        hole.absarc(0.45, 0.2, r * 0.85, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.15,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 3,
        });
    }, []);

    useFrame(({ clock }) => {
        if (!groupRef.current || !glowRef.current) return;
        const t = clock.getElapsedTime();

        // Slow gentle rotation
        groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.05;
        groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.03;

        // Breathing glow
        const glowScale = 2.5 + Math.sin(t * 0.5) * 0.15;
        glowRef.current.scale.setScalar(glowScale);

        // Glow opacity breathing
        const mat = glowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.08 + Math.sin(t * 0.3) * 0.02;
    });

    return (
        <group ref={groupRef} position={[4, 3, -15]}>
            {/* Moon body */}
            <mesh geometry={moonGeo}>
                <meshStandardMaterial
                    color="#F5D380"
                    emissive="#F5D380"
                    emissiveIntensity={0.4}
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Volumetric glow sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#F5D380"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Point light from moon */}
            <pointLight
                color="#F5D380"
                intensity={2}
                distance={60}
                decay={2}
            />

            {/* Secondary soft light */}
            <pointLight
                color="#C8D0E0"
                intensity={0.8}
                distance={40}
                decay={2}
                position={[0, 0, 2]}
            />
        </group>
    );
};

export default Moon3D;
