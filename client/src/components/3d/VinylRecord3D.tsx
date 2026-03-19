import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface VinylProps {
    imageUrl: string;
    isPlaying: boolean;
}

const VinylMesh: React.FC<VinylProps> = ({ imageUrl, isPlaying }) => {
    const groupRef = useRef<THREE.Group>(null);
    const texture = useLoader(THREE.TextureLoader, imageUrl || 'https://via.placeholder.com/300');
    
    // Ensure texture is circular and centered
    texture.center.set(0.5, 0.5);

    useFrame((_, delta) => {
        if (isPlaying && groupRef.current) {
            // Spin smoothly on the Z axis (same plane as screen)
            groupRef.current.rotation.z -= delta * 1.5;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Dark outer ring / border */}
            <mesh>
                <circleGeometry args={[2.05, 64]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.6} />
            </mesh>

            {/* Album Art Circle */}
            <mesh position={[0, 0, 0.01]}>
                <circleGeometry args={[2, 64]} />
                <meshBasicMaterial map={texture} />
            </mesh>

            {/* Center decoration (Blue disc like in screenshot) */}
            <mesh position={[0, 0, 0.02]}>
                <circleGeometry args={[0.3, 32]} />
                <meshBasicMaterial color="#4A90E2" />
            </mesh>
            
            <mesh position={[0, 0, 0.03]}>
                <circleGeometry args={[0.08, 32]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
        </group>
    );
};

const VinylRecord3D: React.FC<VinylProps> = ({ imageUrl, isPlaying }) => {
    return (
        <div style={{
            width: '100%', 
            height: '100%', 
            // Removed borderRadius: '50%' as it can cause clipping issues with 3D Canvas
            overflow: 'visible',
            position: 'relative'
        }}>
            {/* Soft pink glow behind the record when playing */}
            <div style={{
                position: 'absolute',
                inset: '5%', // slightly larger
                borderRadius: '50%',
                background: isPlaying ? 'var(--accent-pink)' : 'transparent',
                filter: 'blur(20px)',
                opacity: isPlaying ? 0.25 : 0,
                transition: 'opacity 1s ease',
                zIndex: 0
            }} />
            
            <Canvas 
                dpr={[1, 2]}
                camera={{ position: [0, 0, 6], fov: 45 }} // Moved back to 6 to avoid clipping
                gl={{ antialias: true, alpha: true }}
                style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}
            >
                <ambientLight intensity={0.7} />
                <pointLight position={[5, 5, 5]} intensity={1.5} color="#F2A7C3" />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#C4B1D4" />
                
                <React.Suspense fallback={null}>
                    <VinylMesh imageUrl={imageUrl} isPlaying={isPlaying} />
                </React.Suspense>
            </Canvas>
        </div>
    );
};

export default VinylRecord3D;
