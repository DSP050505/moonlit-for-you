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
    // Let's just use it linearly mapping the square onto the circle

    useFrame((_, delta) => {
        if (isPlaying && groupRef.current) {
            // Spin record
            groupRef.current.rotation.y -= delta * 1.5;
        }
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 6, 0, 0]}>
            {/* Record Base (Black Disc) */}
            <mesh>
                <cylinderGeometry args={[2, 2, 0.1, 64]} />
                <meshStandardMaterial 
                    color="#0a0a0a" 
                    roughness={0.2} 
                    metalness={0.8}
                />
            </mesh>

            {/* Subtle Grooves Layer */}
            <mesh position={[0, 0.052, 0]}>
                <ringGeometry args={[0.85, 1.95, 64]} />
                {/* Rotate ring to lie flat */}
                <primitive object={new THREE.MeshStandardMaterial({
                    color: '#111111',
                    roughness: 0.4,
                    metalness: 0.9,
                    side: THREE.DoubleSide
                })} attach="material" />
            </mesh>

            {/* Album Art Label */}
            <mesh position={[0, 0.053, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.01, 64]} />
                <meshBasicMaterial map={texture} />
            </mesh>

            {/* Center Hole */}
            <mesh position={[0, 0.07, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.02, 32]} />
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
            borderRadius: '50%',
            overflow: 'visible', // allow 3d perspective to pop out
            position: 'relative'
        }}>
            {/* Soft pink glow behind the record when playing */}
            <div style={{
                position: 'absolute',
                inset: '10%',
                borderRadius: '50%',
                background: isPlaying ? 'var(--accent-pink)' : 'transparent',
                filter: 'blur(15px)',
                opacity: isPlaying ? 0.3 : 0,
                transition: 'opacity 1s ease',
                zIndex: 0
            }} />
            
            <Canvas 
                dpr={[1, 2]}
                camera={{ position: [0, 0, 5], fov: 45 }} 
                gl={{ antialias: true, alpha: true }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                <ambientLight intensity={0.6} />
                <pointLight position={[5, 5, 5]} intensity={1.5} color="#F2A7C3" />
                <pointLight position={[-5, 5, -5]} intensity={1} color="#C4B1D4" />
                
                <React.Suspense fallback={null}>
                    <VinylMesh imageUrl={imageUrl} isPlaying={isPlaying} />
                </React.Suspense>
            </Canvas>
        </div>
    );
};

export default VinylRecord3D;
