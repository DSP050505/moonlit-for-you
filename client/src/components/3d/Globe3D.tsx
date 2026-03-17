import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeProps {
    city1: { lat: number; lng: number; name: string };
    city2: { lat: number; lng: number; name: string };
}

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
    );
}

// Custom pulsing marker component
const CityMarker = ({ pos, color, name }: { pos: THREE.Vector3, color: string, name: string }) => {
    return (
        <group position={pos}>
            {/* Core dot */}
            <mesh>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Outer glow ring */}
            <mesh>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
            {/* Point Light */}
            <pointLight distance={3} intensity={2} color={color} />
            
            {/* HTML Label */}
            <Html center distanceFactor={15} style={{ pointerEvents: 'none' }}>
                <div style={{
                    background: 'rgba(28, 32, 56, 0.7)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${color}`,
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '12px',
                    boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 10px ${color}40`,
                    whiteSpace: 'nowrap',
                    transform: 'translateY(-25px)'
                }}>
                    {name}
                </div>
            </Html>
        </group>
    );
};

function GlobeMesh({ city1, city2 }: GlobeProps) {
    const globeRef = useRef<THREE.Mesh>(null);
    const heartRef = useRef<THREE.Mesh>(null);
    const arcProgress = useRef(0);

    const globeRadius = 2.5;
    const pos1 = useMemo(() => latLngToVec3(city1.lat, city1.lng, globeRadius), [city1]);
    const pos2 = useMemo(() => latLngToVec3(city2.lat, city2.lng, globeRadius), [city2]);

    // Create arc curve between cities
    const arcCurve = useMemo(() => {
        const mid = pos1.clone().add(pos2).multiplyScalar(0.5);
        // Push the mid point out to create an arch. Distance affects height.
        const dist = pos1.distanceTo(pos2);
        mid.normalize().multiplyScalar(globeRadius + (dist * 0.4)); 
        return new THREE.QuadraticBezierCurve3(pos1, mid, pos2);
    }, [pos1, pos2]);

    const arcPoints = useMemo(() => {
        return arcCurve.getPoints(50);
    }, [arcCurve]);

    useFrame(({ clock }) => {
        if (globeRef.current) {
            globeRef.current.rotation.y = clock.getElapsedTime() * 0.05;
        }

        // Animate heart along arc
        arcProgress.current = (arcProgress.current + 0.002) % 1;
        if (heartRef.current) {
            const p = arcCurve.getPoint(arcProgress.current);
            heartRef.current.position.copy(p);
            heartRef.current.lookAt(0, 0, 0);
        }
    });

    return (
        <group ref={globeRef}>
            {/* Dark Oceans Base */}
            <mesh>
                <sphereGeometry args={[globeRadius * 0.99, 64, 64]} />
                <meshStandardMaterial
                    color="#0B0E1A"
                    roughness={0.8}
                />
            </mesh>

            {/* Wireframe Continents Layer */}
            <mesh>
                <sphereGeometry args={[globeRadius, 48, 48]} />
                <meshStandardMaterial
                    color="#4A5580"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Subtle atmosphere glow */}
            <mesh>
                <sphereGeometry args={[globeRadius * 1.05, 32, 32]} />
                <meshBasicMaterial
                    color="#C4B1D4"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <CityMarker pos={pos1} color="#E8788A" name={city1.name} />
            <CityMarker pos={pos2} color="#F5D380" name={city2.name} />

            {/* Light beam arc */}
            <Line
                points={arcPoints}
                color="#F2A7C3"
                lineWidth={3}
                transparent
                opacity={0.6}
            />

            {/* Traveling glowing heart/particle */}
            <mesh ref={heartRef}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color="#fff" />
                <pointLight distance={2} intensity={2} color="#F2A7C3" />
            </mesh>

            {/* Ambient & Rim lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#C8D0E0" intensity={1} />
            <pointLight position={[-10, -10, -10]} color="#4A5580" intensity={0.5} />
        </group>
    );
}

interface Globe3DProps {
    city1: { lat: number; lng: number; name: string };
    city2: { lat: number; lng: number; name: string };
}

const Globe3D: React.FC<Globe3DProps> = ({ city1, city2 }) => {
    return (
        <div style={{
            width: '100%',
            height: '400px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'radial-gradient(circle at center, rgba(28, 32, 56, 0.4) 0%, rgba(11, 14, 26, 0.8) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 30px rgba(255,255,255,0.02)',
            transformStyle: 'preserve-3d',
            perspective: '1000px',
        }}>
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, 80], fov: 45 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
            >
                <GlobeMesh city1={city1} city2={city2} />
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI * 0.70}
                    minPolarAngle={Math.PI * 0.30}
                    enableDamping
                    dampingFactor={0.05}
                />
            </Canvas>
        </div>
    );
};

export default Globe3D;
