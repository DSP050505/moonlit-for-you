import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 200;

const DustParticles: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, velocities } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities: [number, number, number][] = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Spread around camera view
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

            // Slow brownian drift velocities
            velocities.push([
                (Math.random() - 0.5) * 0.003,
                (Math.random() - 0.5) * 0.002,
                (Math.random() - 0.5) * 0.001,
            ]);
        }

        return { positions, velocities };
    }, []);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;
        const geo = pointsRef.current.geometry;
        const posAttr = geo.attributes.position as THREE.BufferAttribute;
        const t = clock.getElapsedTime();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const [vx, vy, vz] = velocities[i];
            posAttr.setX(i, posAttr.getX(i) + vx + Math.sin(t * 0.5 + i) * 0.001);
            posAttr.setY(i, posAttr.getY(i) + vy + Math.cos(t * 0.3 + i) * 0.001);
            posAttr.setZ(i, posAttr.getZ(i) + vz);

            // Wrap around bounds
            if (Math.abs(posAttr.getX(i)) > 15) posAttr.setX(i, -posAttr.getX(i) * 0.9);
            if (Math.abs(posAttr.getY(i)) > 10) posAttr.setY(i, -posAttr.getY(i) * 0.9);
        }

        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#F5D380"
                size={0.04}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </points>
    );
};

export default DustParticles;
