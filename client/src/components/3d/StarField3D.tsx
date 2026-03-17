import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 3000;

const StarField3D: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate star positions and properties
    const { positions, colors, scales, twinkleOffsets } = useMemo(() => {
        const positions: [number, number, number][] = [];
        const colors: [number, number, number][] = [];
        const scales: number[] = [];
        const twinkleOffsets: number[] = [];

        // Gold: #F5D380, Silver: #C8D0E0, White: #FFFFFF
        const colorPalette: [number, number, number][] = [
            [0.96, 0.83, 0.50], // gold
            [0.78, 0.82, 0.88], // silver
            [1.0, 1.0, 1.0],    // white
            [0.95, 0.65, 0.76],  // pink tint (rare)
        ];

        for (let i = 0; i < STAR_COUNT; i++) {
            // Distribute across a large sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 30 + Math.random() * 120; // 3 depth layers: 30-50, 50-80, 80-150

            positions.push([
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi),
            ]);

            // Most white/silver, rare gold/pink
            const colorIdx = Math.random() < 0.05 ? 3 : Math.random() < 0.15 ? 0 : Math.random() < 0.5 ? 1 : 2;
            colors.push(colorPalette[colorIdx]);

            scales.push(0.02 + Math.random() * 0.06); // tiny sizes
            twinkleOffsets.push(Math.random() * Math.PI * 2);
        }

        return { positions, colors, scales, twinkleOffsets };
    }, []);

    // Initialize and animate
    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const time = clock.getElapsedTime();

        for (let i = 0; i < STAR_COUNT; i++) {
            const [x, y, z] = positions[i];
            dummy.position.set(x, y, z);

            // Twinkle: scale varies with time
            const twinkle = 0.5 + 0.5 * Math.sin(time * 0.8 + twinkleOffsets[i]);
            const s = scales[i] * (0.6 + twinkle * 0.4);
            dummy.scale.setScalar(s);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Color with twinkle brightness
            const [r, g, b] = colors[i];
            meshRef.current.setColorAt(i, new THREE.Color(r * twinkle, g * twinkle, b * twinkle));
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }

        // Very slow rotation of entire star field for living feel
        meshRef.current.rotation.y = time * 0.003;
        meshRef.current.rotation.x = Math.sin(time * 0.002) * 0.01;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
    );
};

export default StarField3D;
