import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Photo {
    id: number;
    url: string;
    caption: string;
    date: string;
    gradient: string;
}

// Demo photos with gradient placeholders (will be replaced with real images)
const demoPhotos: Photo[] = [
    { id: 1, url: '', caption: 'Our first video call 💕', date: '2025-06-15', gradient: 'linear-gradient(135deg, #E8788A, #F2A7C3)' },
    { id: 2, url: '', caption: 'Watching the sunset together (virtually!) 🌅', date: '2025-07-22', gradient: 'linear-gradient(135deg, #F5D380, #E8788A)' },
    { id: 3, url: '', caption: 'Matching outfits day 👗', date: '2025-08-10', gradient: 'linear-gradient(135deg, #C4B1D4, #F2A7C3)' },
    { id: 4, url: '', caption: 'Late night study session 📚', date: '2025-09-05', gradient: 'linear-gradient(135deg, #7ECFA0, #C4B1D4)' },
    { id: 5, url: '', caption: 'Anniversary celebration 🎂', date: '2025-10-14', gradient: 'linear-gradient(135deg, #F2A7C3, #E8788A)' },
    { id: 6, url: '', caption: 'Moon watching night 🌙', date: '2025-11-20', gradient: 'linear-gradient(135deg, #C8D0E0, #C4B1D4)' },
    { id: 7, url: '', caption: 'New Year together ✨', date: '2026-01-01', gradient: 'linear-gradient(135deg, #F5D380, #F2A7C3)' },
    { id: 8, url: '', caption: 'Valentine\'s Day 💝', date: '2026-02-14', gradient: 'linear-gradient(135deg, #E8788A, #C4B1D4)' },
];

/* 3D Tilt Card Component for Grid Items */
const PerspectiveCard: React.FC<{
    photo: Photo,
    index: number,
    onClick: () => void
}> = ({ photo, index, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);

    const mouseXSpring = useSpring(mx);
    const mouseYSpring = useSpring(my);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        mx.set(xPct);
        my.set(yPct);
    };

    const handleMouseLeave = () => {
        mx.set(0);
        my.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, z: -100, rotateX: 30 }}
            animate={{ opacity: 1, z: 0, rotateX: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 150, damping: 20 }}
            whileHover={{ scale: 1.05, z: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                cursor: 'pointer',
                perspective: '1000px',
                transformStyle: 'preserve-3d',
                rotateX,
                rotateY,
            }}
        >
            <div style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-card)',
                background: photo.gradient,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
                position: 'relative',
                transformStyle: 'preserve-3d',
            }}>
                {/* Photo placeholder icon floating in 3D */}
                <span style={{
                    fontSize: '2.5rem',
                    marginBottom: '8px',
                    opacity: 0.8,
                    transform: 'translateZ(30px)'
                }}>
                    📷
                </span>

                {/* Caption overlay flat on surface */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    transform: 'translateZ(10px)',
                }}>
                    <p style={{
                        color: '#fff',
                        fontSize: '0.75rem',
                        margin: 0,
                        fontFamily: 'var(--font-heading)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}>
                        {photo.caption}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const PhotoGallery: React.FC = () => {
    const [photos] = useState<Photo[]>(demoPhotos);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: 'var(--space-4)',
                perspective: '1200px'
            }}
            className="gallery-container"
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
                transform: 'translateZ(20px)'
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                }}>
                    📸 Our Memories
                </h2>
                <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                }}>
                    {photos.length} moments captured
                </span>
            </div>

            {/* Photo Grid with 3D elements */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
                transformStyle: 'preserve-3d'
            }}>
                {photos.map((photo, i) => (
                    <PerspectiveCard 
                        key={photo.id} 
                        photo={photo} 
                        index={i} 
                        onClick={() => setSelectedPhoto(photo)} 
                    />
                ))}
            </div>

            {/* Lightbox Modal (3D Zoom/Fly-in) */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        onClick={() => setSelectedPhoto(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(5, 7, 15, 0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 'var(--space-8)',
                            perspective: '2000px',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, z: -1000, rotateY: 90, opacity: 0 }}
                            animate={{ scale: 1, z: 0, rotateY: 0, opacity: 1 }}
                            exit={{ scale: 1.5, z: 500, rotateY: -45, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            onClick={e => e.stopPropagation()}
                            style={{ 
                                maxWidth: '700px', 
                                width: '100%',
                                transformStyle: 'preserve-3d' 
                            }}
                        >
                            {/* Photo display */}
                            <div style={{
                                aspectRatio: '16/9',
                                borderRadius: 'var(--radius-lg)',
                                background: selectedPhoto.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--space-4)',
                                boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.2)',
                                transformStyle: 'preserve-3d'
                            }}>
                                <motion.span 
                                    initial={{ z: 0 }}
                                    animate={{ z: 50 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    style={{ fontSize: '6rem', transform: 'translateZ(50px)' }}
                                >
                                    📷
                                </motion.span>
                            </div>

                            {/* Details Floating in 3D */}
                            <div style={{ textAlign: 'center', transform: 'translateZ(40px)' }}>
                                <p style={{
                                    fontFamily: 'var(--font-handwriting)',
                                    color: 'var(--accent-pink)',
                                    fontSize: '1.8rem',
                                    marginBottom: '8px',
                                    textShadow: '0 4px 15px rgba(242, 167, 195, 0.4)'
                                }}>
                                    {selectedPhoto.caption}
                                </p>
                                <p style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.9rem',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                                        month: 'long', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PhotoGallery;
