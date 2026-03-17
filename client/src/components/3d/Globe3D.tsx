import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
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

function GlobeMesh({ city1, city2 }: GlobeProps) {
    const globeRef = useRef<THREE.Mesh>(null);
    const heartRef = useRef<THREE.Mesh>(null);
    const arcProgress = useRef(0);

    const pos1 = useMemo(() => latLngToVec3(city1.lat, city1.lng, 2), [city1]);
    const pos2 = useMemo(() => latLngToVec3(city2.lat, city2.lng, 2), [city2]);

    // Create arc curve between cities
    const arcCurve = useMemo(() => {
        const mid = pos1.clone().add(pos2).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(3); // lift arc above surface
        return new THREE.QuadraticBezierCurve3(pos1, mid, pos2);
    }, [pos1, pos2]);

    const arcPoints = useMemo(() => {
        return arcCurve.getPoints(64).map(p => [p.x, p.y, p.z] as [number, number, number]);
    }, [arcCurve]);

    useFrame(({ clock }) => {
        if (globeRef.current) {
            globeRef.current.rotation.y = clock.getElapsedTime() * 0.05;
        }

        // Animate heart along arc
        arcProgress.current = (arcProgress.current + 0.003) % 1;
        if (heartRef.current) {
            const p = arcCurve.getPoint(arcProgress.current);
            heartRef.current.position.copy(p);
            heartRef.current.lookAt(0, 0, 0);
        }
    });

    return (
        <group>
            {/* Globe wireframe */}
            <mesh ref={globeRef}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial
                    color="#1C2038"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Globe surface glow */}
            <mesh>
                <sphereGeometry args={[1.98, 32, 32]} />
                <meshStandardMaterial
                    color="#0B0E1A"
                    transparent
                    opacity={0.6}
                    roughness={1}
                />
            </mesh>

            {/* City 1 point */}
            <mesh position={pos1}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color="#E8788A" />
            </mesh>
            <pointLight position={pos1} color="#E8788A" intensity={1} distance={1} />

            {/* City 2 point */}
            <mesh position={pos2}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color="#F2A7C3" />
            </mesh>
            <pointLight position={pos2} color="#F2A7C3" intensity={1} distance={1} />

            {/* Light beam arc */}
            <Line
                points={arcPoints}
                color="#F5D380"
                lineWidth={2}
                transparent
                opacity={0.6}
            />

            {/* Traveling heart */}
            <mesh ref={heartRef}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial
                    color="#F2A7C3"
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Ambient light */}
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} color="#C8D0E0" intensity={0.8} />
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
            height: '350px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'rgba(11, 14, 26, 0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
        }}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
            >
                <GlobeMesh city1={city1} city2={city2} />
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.3}
                    maxPolarAngle={Math.PI * 0.75}
                    minPolarAngle={Math.PI * 0.25}
                />
            </Canvas>
        </div>
    );
};

export default Globe3D;
