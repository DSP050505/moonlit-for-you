import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ShootingStar: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.Mesh>(null);
    const [active, setActive] = useState(false);
    const startPos = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const progress = useRef(0);

    // Trigger shooting star randomly every 8-15 seconds
    useEffect(() => {
        const trigger = () => {
            // Random start position (top area of view)
            startPos.current.set(
                (Math.random() - 0.5) * 20,
                5 + Math.random() * 8,
                -10 - Math.random() * 20
            );

            // Diagonal downward direction
            direction.current.set(
                (Math.random() - 0.3) * 0.4,
                -0.3 - Math.random() * 0.2,
                -0.1,
            ).normalize();

            progress.current = 0;
            setActive(true);
        };

        const schedule = () => {
            const delay = 8000 + Math.random() * 7000;
            return setTimeout(() => {
                trigger();
                schedule();
            }, delay);
        };

        // First one after 5s
        const initial = setTimeout(() => {
            trigger();
            schedule();
        }, 5000);

        return () => clearTimeout(initial);
    }, []);

    useFrame((_, delta) => {
        if (!active || !meshRef.current || !trailRef.current) return;

        progress.current += delta * 2.5;

        const pos = startPos.current.clone().add(
            direction.current.clone().multiplyScalar(progress.current * 25)
        );

        meshRef.current.position.copy(pos);
        trailRef.current.position.copy(pos);

        // Trail stretches behind
        trailRef.current.lookAt(
            pos.x - direction.current.x,
            pos.y - direction.current.y,
            pos.z - direction.current.z,
        );

        // Fade out
        const opacity = Math.max(0, 1 - progress.current * 0.8);
        const headMat = meshRef.current.material as THREE.MeshBasicMaterial;
        const trailMat = trailRef.current.material as THREE.MeshBasicMaterial;
        headMat.opacity = opacity;
        trailMat.opacity = opacity * 0.5;

        if (progress.current > 1.5) {
            setActive(false);
        }
    });

    if (!active) return null;

    return (
        <group>
            {/* Star head */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial
                    color="#FFFFFF"
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Trail */}
            <mesh ref={trailRef}>
                <planeGeometry args={[0.03, 1.5]} />
                <meshBasicMaterial
                    color="#F5D380"
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

export default ShootingStar;
