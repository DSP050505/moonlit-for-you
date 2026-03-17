import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
    currentPage: string;
}

// Page-specific camera offsets for subtle spatial feel
const pageOffsets: Record<string, [number, number, number]> = {
    '/chat': [0, 0, 0],
    '/calendar': [0.3, 0.2, -0.5],
    '/map': [-0.3, -0.1, -1],
    '/music': [0.2, -0.2, 0.3],
    '/gallery': [-0.2, 0.3, -0.3],
    '/letters': [0.1, 0.1, 0.2],
    '/games': [-0.1, -0.3, -0.2],
};

const CameraController: React.FC<CameraControllerProps> = ({ currentPage }) => {
    const { camera } = useThree();
    const mouse = useRef({ x: 0, y: 0 });
    const targetPos = useRef(new THREE.Vector3(0, 0, 8));
    const currentPos = useRef(new THREE.Vector3(0, 0, 8));

    // Track mouse position
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    // Update target on page change
    useEffect(() => {
        const offset = pageOffsets[currentPage] || [0, 0, 0];
        targetPos.current.set(offset[0], offset[1], 8 + offset[2]);
    }, [currentPage]);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        // Idle drift
        const driftX = Math.sin(t * 0.05) * 0.1;
        const driftY = Math.cos(t * 0.03) * 0.06;

        // Mouse influence (very subtle)
        const mouseX = mouse.current.x * 0.15;
        const mouseY = -mouse.current.y * 0.1;

        // Target = page offset + drift + mouse
        const goalX = targetPos.current.x + driftX + mouseX;
        const goalY = targetPos.current.y + driftY + mouseY;
        const goalZ = targetPos.current.z;

        // Smooth lerp toward goal
        currentPos.current.x += (goalX - currentPos.current.x) * 0.02;
        currentPos.current.y += (goalY - currentPos.current.y) * 0.02;
        currentPos.current.z += (goalZ - currentPos.current.z) * 0.03;

        camera.position.set(currentPos.current.x, currentPos.current.y, currentPos.current.z);

        // Subtle look-at follows mouse
        camera.lookAt(
            mouseX * 0.1,
            mouseY * 0.1,
            0,
        );
    });

    return null;
};

export default CameraController;
