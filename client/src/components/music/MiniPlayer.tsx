import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMusicPlayer } from '../../context/MusicContext';

/**
 * Floating mini-player that appears when music is playing
 * and the user is NOT on the /music page.
 */
const MiniPlayer: React.FC = () => {
    const { currentTrack, isPlaying, togglePlayPause, progress } = useMusicPlayer();
    const location = useLocation();
    const navigate = useNavigate();

    const isOnMusicPage = location.pathname === '/music';
    const show = currentTrack && !isOnMusicPage;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 80, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 80, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '16px',
                        zIndex: 150,
                        width: '220px',
                        background: 'rgba(28, 32, 56, 0.95)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/music')}
                >
                    {/* Progress bar at top */}
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-pink))',
                            transition: 'width 0.4s linear',
                        }} />
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                    }}>
                        {/* Spinning thumbnail */}
                        <motion.div
                            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                            transition={isPlaying ? { duration: 6, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid var(--accent-pink)',
                                flexShrink: 0,
                            }}
                        >
                            <img
                                src={currentTrack!.thumbnail}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </motion.div>

                        {/* Song info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-heading)',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {currentTrack!.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', margin: 0 }}>
                                {currentTrack!.channel}
                            </p>
                        </div>

                        {/* Play/Pause */}
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                            style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                border: 'none', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                                flexShrink: 0,
                            }}
                        >
                            {isPlaying ? '⏸️' : '▶️'}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MiniPlayer;
