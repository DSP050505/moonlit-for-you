import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`);

interface Photo {
    id: number;
    url: string;
    caption: string | null;
    uploadedBy: string;
    takenAt: string | null;
    createdAt: string;
}

/* ─── 3D Tilt Card ─── */
const PerspectiveCard: React.FC<{
    photo: Photo;
    index: number;
    onClick: () => void;
}> = ({ photo, index, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [imgError, setImgError] = useState(false);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const mouseXSpring = useSpring(mx);
    const mouseYSpring = useSpring(my);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => { mx.set(0); my.set(0); };
    const imageUrl = photo.url.startsWith('http') ? photo.url : `${API}${photo.url}`;

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 150, damping: 20 }}
            whileHover={{ scale: 1.04 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                cursor: 'pointer',
                perspective: '800px',
                transformStyle: 'preserve-3d',
                rotateX, rotateY,
            }}
        >
            <div style={{
                aspectRatio: '1',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)',
                position: 'relative',
                background: 'rgba(28, 32, 56, 0.6)',
            }}>
                {!imgError ? (
                    <img
                        src={imageUrl}
                        alt={photo.caption || 'Memory'}
                        onError={() => setImgError(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                        loading="lazy"
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.3)'
                    }}>
                        <div style={{ fontSize: '2rem' }}>⚠️</div>
                    </div>
                )}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '24px 12px 10px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                }}>
                    {photo.caption && (
                        <p style={{
                            color: '#fff', fontSize: '0.78rem', margin: 0,
                            fontFamily: 'var(--font-heading)',
                            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                            lineHeight: 1.35,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {photo.caption}
                        </p>
                    )}
                    {photo.takenAt && (
                        <p style={{
                            color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem',
                            margin: '3px 0 0', fontFamily: 'var(--font-mono)',
                        }}>
                            {new Date(photo.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Upload Modal (rendered via Portal) ─── */
const UploadModal: React.FC<{
    onClose: () => void;
    onUploaded: (photo: Photo) => void;
    roomId: number;
    userRole: string;
}> = ({ onClose, onUploaded, roomId, userRole }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [date, setDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreview(null);
    }, [file]);

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('photo', file);
            fd.append('roomId', String(roomId));
            fd.append('uploadedBy', userRole);
            if (caption.trim()) fd.append('caption', caption.trim());
            if (date) fd.append('takenAt', date);

            const res = await fetch(`${API}/api/photos`, { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            onUploaded(data.photo);
            onClose();
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', color: '#fff',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        outline: 'none', transition: 'border 0.2s',
        boxSizing: 'border-box',
    };

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(5, 7, 15, 0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '20px',
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '440px',
                    background: 'rgba(20, 24, 44, 0.98)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
                    padding: '28px',
                    maxHeight: '90vh', overflowY: 'auto',
                }}
            >
                {/* Header with back */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: '1.1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        ←
                    </button>
                    <h3 style={{
                        fontFamily: 'var(--font-heading)', color: '#fff',
                        fontSize: '1.15rem', margin: '0 0 0 12px',
                    }}>
                        Add a Memory
                    </h3>
                </div>

                {/* File picker area */}
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        borderRadius: '16px',
                        border: preview ? '1px solid rgba(255,255,255,0.06)' : '2px dashed rgba(242,167,195,0.25)',
                        background: preview ? 'rgba(0,0,0,0.2)' : 'rgba(242,167,195,0.03)',
                        minHeight: preview ? 'auto' : '160px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', overflow: 'hidden', marginBottom: '18px',
                    }}
                >
                    {preview ? (
                        <img src={preview} alt="Preview" style={{
                            width: '100%', maxHeight: '260px', objectFit: 'contain',
                            display: 'block', borderRadius: '14px',
                        }} />
                    ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>
                            <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>📷</div>
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>Tap to choose a photo</p>
                        </div>
                    )}
                    <input
                        ref={fileRef} type="file" accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                </div>

                <input
                    type="text" placeholder="Write a caption…"
                    value={caption} onChange={e => setCaption(e.target.value)}
                    style={{ ...inputStyle, marginBottom: '12px' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(242,167,195,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />

                <input
                    type="date" value={date} onChange={e => setDate(e.target.value)}
                    style={{ ...inputStyle, marginBottom: '22px', colorScheme: 'dark' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(242,167,195,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />

                <button
                    onClick={handleSubmit}
                    disabled={!file || uploading}
                    style={{
                        width: '100%', padding: '14px',
                        background: file ? 'linear-gradient(135deg, #F2A7C3, #E8788A)' : 'rgba(255,255,255,0.06)',
                        border: 'none', borderRadius: '14px',
                        color: file ? '#fff' : 'rgba(255,255,255,0.3)',
                        fontFamily: 'var(--font-heading)', fontSize: '0.95rem',
                        cursor: file ? 'pointer' : 'default',
                        opacity: uploading ? 0.6 : 1,
                        boxShadow: file ? '0 8px 25px rgba(242,167,195,0.3)' : 'none',
                    }}
                >
                    {uploading ? '✨ Saving…' : '💕 Save Memory'}
                </button>
            </motion.div>
        </div>,
        document.body
    );
};

/* ─── Lightbox (rendered via Portal) ─── */
const Lightbox: React.FC<{
    photo: Photo;
    onClose: () => void;
    onDelete: (id: number) => void;
}> = ({ photo, onClose, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(photo.id);
    };

    const imageUrl = photo.url.startsWith('http') ? photo.url : `${API}${photo.url}`;

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(5, 7, 15, 0.93)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                zIndex: 9999,
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Top bar — Back + Delete */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    padding: '16px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 18px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#fff', fontSize: '0.85rem',
                        fontFamily: 'var(--font-heading)',
                        cursor: 'pointer',
                    }}
                >
                    ← Back
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                        padding: '8px 16px',
                        background: 'rgba(255, 70, 70, 0.12)',
                        border: '1px solid rgba(255, 70, 70, 0.2)',
                        borderRadius: '12px',
                        color: 'rgba(255, 120, 120, 0.9)',
                        fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
                        cursor: 'pointer',
                        opacity: deleting ? 0.5 : 1,
                    }}
                >
                    {deleting ? 'Deleting…' : '🗑️ Delete'}
                </button>
            </div>

            {/* Centered photo + info */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '0 24px 40px',
                    overflow: 'auto',
                }}
            >
                {/* Photo */}
                {!imgError ? (
                    <img
                        src={imageUrl}
                        alt={photo.caption || 'Memory'}
                        onError={() => setImgError(true)}
                        style={{
                            maxWidth: '80vw',
                            maxHeight: '55vh',
                            objectFit: 'contain',
                            borderRadius: '16px',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
                            display: 'block',
                            marginBottom: '24px',
                        }}
                    />
                ) : (
                    <div style={{
                        maxWidth: '80vw', width: '400px', height: '300px',
                        background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '24px', border: '1px dashed rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>⚠️</div>
                        <p style={{ color: 'var(--text-muted)' }}>Image failed to load</p>
                    </div>
                )}

                {/* Caption + date */}
                <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                    {photo.caption && (
                        <p style={{
                            fontFamily: 'var(--font-heading)',
                            color: '#F2A7C3',
                            fontSize: '1.5rem', margin: '0 0 8px',
                            textShadow: '0 3px 12px rgba(242,167,195,0.3)',
                            lineHeight: 1.3,
                        }}>
                            {photo.caption}
                        </p>
                    )}
                    {photo.takenAt && (
                        <p style={{
                            color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
                            fontFamily: 'var(--font-mono)', margin: '0 0 6px',
                        }}>
                            {new Date(photo.takenAt).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric',
                            })}
                        </p>
                    )}
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', margin: 0 }}>
                        Added by {photo.uploadedBy}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

/* ─── Main Gallery ─── */
const PhotoGallery: React.FC = () => {
    const { session } = useAuth();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [loading, setLoading] = useState(true);

    const roomId = session?.room.id || 1;
    const userRole = session?.user.role || 'DSP';

    const fetchPhotos = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/photos?roomId=${roomId}`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setPhotos(data.photos);
        } catch (err) {
            console.error('Error fetching photos:', err);
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

    const handleUploaded = (photo: Photo) => {
        setPhotos(prev => [photo, ...prev]);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${API}/api/photos/${id}`, { method: 'DELETE' });
            const data = await res.json();
            console.log('Delete response:', res.status, data);
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            setPhotos(prev => prev.filter(p => p.id !== id));
            setSelectedPhoto(null);
        } catch (err) {
            console.error('Error deleting photo:', err);
            alert('Failed to delete. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-4)' }}
            className="gallery-container"
        >
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 'var(--space-6)',
            }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>
                    📸 Our Memories
                </h2>
                <button
                    onClick={() => setShowUpload(true)}
                    style={{
                        padding: '10px 22px',
                        background: 'linear-gradient(135deg, rgba(242,167,195,0.2), rgba(232,120,138,0.2))',
                        border: '1px solid rgba(242,167,195,0.25)',
                        borderRadius: '14px',
                        color: 'var(--accent-pink)',
                        fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 15px rgba(242,167,195,0.1)',
                    }}
                >
                    <span>✨</span> Add Memory
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🌙</div>
                    <p>Loading memories…</p>
                </div>
            )}

            {/* Empty */}
            {!loading && photos.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '80px 20px',
                    background: 'rgba(28, 32, 56, 0.3)',
                    borderRadius: '24px',
                    border: '1px dashed rgba(242,167,195,0.15)',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💫</div>
                    <h3 style={{
                        fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
                        fontSize: '1.3rem', marginBottom: '8px',
                    }}>No Memories Yet</h3>
                    <p style={{
                        color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px',
                        margin: '0 auto 24px', lineHeight: 1.6,
                    }}>
                        Start capturing your special moments together!
                    </p>
                    <button
                        onClick={() => setShowUpload(true)}
                        style={{
                            padding: '12px 28px',
                            background: 'linear-gradient(135deg, #F2A7C3, #E8788A)',
                            border: 'none', borderRadius: '14px',
                            color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
                            cursor: 'pointer', boxShadow: '0 8px 25px rgba(242,167,195,0.3)',
                        }}
                    >
                        📷 Add First Memory
                    </button>
                </div>
            )}

            {/* Photo Grid */}
            {!loading && photos.length > 0 && (
                <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
                        {photos.length} {photos.length === 1 ? 'moment' : 'moments'} captured
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '16px',
                    }}>
                        {photos.map((photo, i) => (
                            <PerspectiveCard
                                key={photo.id} photo={photo} index={i}
                                onClick={() => setSelectedPhoto(photo)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Upload modal — Portal */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onUploaded={handleUploaded}
                    roomId={roomId}
                    userRole={userRole}
                />
            )}

            {/* Lightbox — Portal */}
            {selectedPhoto && (
                <Lightbox
                    photo={selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onDelete={handleDelete}
                />
            )}
        </motion.div>
    );
};

export default PhotoGallery;
