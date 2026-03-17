import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
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

            {/* Photo Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
            }}>
                {photos.map((photo, i) => (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
                        whileHover={{ y: -6, scale: 1.03 }}
                        onClick={() => setSelectedPhoto(photo)}
                        style={{ cursor: 'pointer' }}
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
                            boxShadow: 'var(--shadow-card)',
                            position: 'relative',
                            transition: 'box-shadow 0.3s ease',
                        }}>
                            {/* Photo placeholder icon */}
                            <span style={{ fontSize: '2.5rem', marginBottom: '8px', opacity: 0.8 }}>
                                📷
                            </span>

                            {/* Caption overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '12px',
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
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
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(12px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 'var(--space-8)',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '500px', width: '100%' }}
                        >
                            {/* Photo display */}
                            <div style={{
                                aspectRatio: '4/3',
                                borderRadius: 'var(--radius-lg)',
                                background: selectedPhoto.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--space-4)',
                                boxShadow: 'var(--shadow-elevated)',
                            }}>
                                <span style={{ fontSize: '5rem' }}>📷</span>
                            </div>

                            {/* Details */}
                            <div style={{ textAlign: 'center' }}>
                                <p style={{
                                    fontFamily: 'var(--font-handwriting)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.2rem',
                                    marginBottom: '4px',
                                }}>
                                    {selectedPhoto.caption}
                                </p>
                                <p style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.8rem',
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
