import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function VinylMesh({ isPlaying, trackColor }: { isPlaying: boolean; trackColor: string }) {
    const discRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!discRef.current) return;
        if (isPlaying) {
            discRef.current.rotation.y += 0.02;
        }
        // Gentle wobble
        discRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.05 - 0.3;
    });

    const grooveTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        // Black disc
        ctx.fillStyle = '#0B0E1A';
        ctx.fillRect(0, 0, 512, 512);

        // Concentric grooves
        const cx = 256, cy = 256;
        for (let r = 40; r < 240; r += 3) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(200, 208, 224, ${0.03 + Math.random() * 0.03})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Center label area
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fillStyle = trackColor;
        ctx.globalAlpha = 0.3;
        ctx.fill();

        // Center hole
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#0B0E1A';
        ctx.globalAlpha = 1;
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, [trackColor]);

    return (
        <group>
            <mesh ref={discRef} rotation={[-0.3, 0, 0]}>
                <cylinderGeometry args={[1.8, 1.8, 0.05, 64]} />
                <meshStandardMaterial
                    map={grooveTexture}
                    roughness={0.3}
                    metalness={0.6}
                    color="#1C2038"
                />
            </mesh>

            {/* Disc edge light */}
            <pointLight
                position={[2, 2, 2]}
                color="#C8D0E0"
                intensity={isPlaying ? 1.5 : 0.5}
                distance={8}
            />
            <pointLight
                position={[-1, -1, 2]}
                color={trackColor}
                intensity={isPlaying ? 0.8 : 0.2}
                distance={6}
            />

            <ambientLight intensity={0.2} />
        </group>
    );
}

interface Vinyl3DProps {
    isPlaying: boolean;
    trackColor: string;
}

const Vinyl3D: React.FC<Vinyl3DProps> = ({ isPlaying, trackColor }) => {
    return (
        <div style={{
            width: '200px',
            height: '200px',
            margin: '0 auto',
        }}>
            <Canvas
                camera={{ position: [0, 1.5, 3], fov: 40 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <VinylMesh isPlaying={isPlaying} trackColor={trackColor} />
            </Canvas>
        </div>
    );
};

export default Vinyl3D;
