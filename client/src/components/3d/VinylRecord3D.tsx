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
    
    // Ensure texture is circular and mapped correctly
    texture.center.set(0.5, 0.5);

    useFrame((_, delta) => {
        if (isPlaying && groupRef.current) {
            // Spin record smoothly
            groupRef.current.rotation.y -= delta * 1.5;
        }
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 10, 0, 0]}>
            {/* Record Base (Black Disc) */}
            <mesh>
                <cylinderGeometry args={[2, 2, 0.02, 64]} />
                <meshStandardMaterial 
                    color="#080808" 
                    roughness={0.1} 
                    metalness={0.9}
                />
            </mesh>

            {/* Subtle Grooves Layer */}
            <mesh position={[0, 0.012, 0]}>
                <ringGeometry args={[0.85, 1.98, 64]} />
                <meshStandardMaterial
                    color="#0a0a0a"
                    roughness={0.3}
                    metalness={1}
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Album Art Label (slightly inset) */}
            <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.005, 64]} />
                <meshBasicMaterial map={texture} />
            </mesh>

            {/* Center Hole Decoration */}
            <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
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
