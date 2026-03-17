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
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 8,
        });
    }, []);

    useFrame(({ clock }) => {
        if (!groupRef.current || !glowRef.current) return;
        const t = clock.getElapsedTime();

        // Very slow majestic wobble
        groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.02;
        groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.02;

        // Breathing optical glow
        const glowScale = 2.8 + Math.sin(t * 0.4) * 0.1;
        glowRef.current.scale.setScalar(glowScale);

        // Pulsing Bloom trigger value in material
        const mat = glowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.05 + Math.sin(t * 0.4) * 0.02;
    });

    return (
        <group ref={groupRef} position={[4, 3, -15]}>
            {/* Moon body */}
            <mesh geometry={moonGeo}>
                <meshStandardMaterial
                    color="#FFDDB0"
                    emissive="#F5D380"
                    emissiveIntensity={1.2}
                    roughness={0.4}
                    metalness={0.8}
                    transparent
                    opacity={0.95}
                />
            </mesh>

            {/* Volumetric glow sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#F5D380"
                    transparent
                    opacity={0.06}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Core point light cast from the moon */}
            <pointLight
                color="#F5D380"
                intensity={4}
                distance={100}
                decay={2}
            />

            {/* Ambient moonlight flood */}
            <pointLight
                color="#C8D0E0"
                intensity={1}
                distance={50}
                decay={2}
                position={[-2, -2, 4]}
            />
        </group>
    );
};

export default Moon3D;
