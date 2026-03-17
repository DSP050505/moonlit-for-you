import React, { createContext, useContext, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import StarField3D from './StarField3D';
import Moon3D from './Moon3D';
import DustParticles from './DustParticles';
import ShootingStar from './ShootingStar';
import Nebula from './Nebula';
import CameraController from './CameraController';

interface SceneContextType {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

const SceneContext = createContext<SceneContextType>({
    currentPage: '/chat',
    setCurrentPage: () => { },
});

export const useScene = () => useContext(SceneContext);

interface SceneProviderProps {
    children: React.ReactNode;
}

const SceneProvider: React.FC<SceneProviderProps> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState('/chat');

    return (
        <SceneContext.Provider value={{ currentPage, setCurrentPage }}>
            {/* 3D Background Canvas — sits behind entire app */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}>
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 1000 }}
                    dpr={[1, 2]}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance',
                    }}
                    style={{ background: '#0B0E1A' }}
                >
                    <AdaptiveDpr pixelated />
                    <Preload all />

                    {/* Ambient lighting */}
                    <ambientLight intensity={0.15} color="#C8D0E0" />

                    {/* Camera controller */}
                    <CameraController currentPage={currentPage} />

                    {/* 3D Scene elements */}
                    <StarField3D />
                    <Moon3D />
                    <Nebula />
                    <DustParticles />
                    <ShootingStar />
                </Canvas>
            </div>

            {/* UI Layer — on top of 3D */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </SceneContext.Provider>
    );
};

export default SceneProvider;
