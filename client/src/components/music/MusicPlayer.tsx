import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../shared/Card';
import Vinyl3D from '../3d/Vinyl3D';

interface Track {
    id: string;
    title: string;
    artist: string;
    emoji: string;
    duration: string;
    color: string;
}

const playlist: Track[] = [
    { id: '1', title: "Can't Help Falling in Love", artist: 'Elvis Presley', emoji: '🎸', duration: '3:07', color: '#E8788A' },
    { id: '2', title: 'A Thousand Years', artist: 'Christina Perri', emoji: '🎻', duration: '4:46', color: '#C4B1D4' },
    { id: '3', title: 'Perfect', artist: 'Ed Sheeran', emoji: '🎵', duration: '4:23', color: '#F2A7C3' },
    { id: '4', title: 'All of Me', artist: 'John Legend', emoji: '🎹', duration: '4:29', color: '#F5D380' },
    { id: '5', title: 'Thinking Out Loud', artist: 'Ed Sheeran', emoji: '🎸', duration: '4:41', color: '#7ECFA0' },
    { id: '6', title: 'Love Story', artist: 'Taylor Swift', emoji: '🎤', duration: '3:54', color: '#C8D0E0' },
    { id: '7', title: 'La Vie en Rose', artist: 'Edith Piaf', emoji: '🌹', duration: '3:22', color: '#E8788A' },
    { id: '8', title: 'Tera Ban Jaunga', artist: 'Akhil Sachdeva', emoji: '💕', duration: '4:13', color: '#F2A7C3' },
];

const MusicPlayer: React.FC = () => {
    const [currentTrack, setCurrentTrack] = useState<Track>(playlist[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePlay = (track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        setProgress(0);
    };

    // Simulate progress
    React.useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setIsPlaying(false);
                    return 0;
                }
                return prev + 0.5;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [isPlaying, currentTrack]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{
                maxWidth: '700px',
                margin: '0 auto',
                padding: 'var(--space-4)',
            }}
            className="music-container"
        >
            <h2 style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: 'var(--space-6)',
            }}>
                🎵 Our Playlist
            </h2>

            {/* Now Playing Card */}
            <Card glow hover3D={false}>
                <div style={{
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                }}>
                    {/* 3D Vinyl Record */}
                    <Vinyl3D isPlaying={isPlaying} trackColor={currentTrack.color} />

                    <h3 style={{
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-primary)',
                        fontSize: '1.1rem',
                        marginBottom: '4px',
                    }}>
                        {currentTrack.title}
                    </h3>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                    }}>
                        {currentTrack.artist}
                    </p>

                    {/* Progress Bar */}
                    <div style={{
                        height: '3px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-pill)',
                        margin: 'var(--space-4) 0',
                        overflow: 'hidden',
                    }}>
                        <motion.div
                            style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${currentTrack.color}, var(--accent-pink))`,
                                borderRadius: 'var(--radius-pill)',
                                width: `${progress}%`,
                            }}
                        />
                    </div>

                    {/* Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                    }}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                const idx = playlist.findIndex(t => t.id === currentTrack.id);
                                handlePlay(playlist[(idx - 1 + playlist.length) % playlist.length]);
                            }}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                fontSize: '1.3rem', cursor: 'pointer',
                            }}
                        >
                            ⏮️
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem',
                                boxShadow: '0 4px 15px rgba(232, 120, 138, 0.4)',
                            }}
                        >
                            {isPlaying ? '⏸️' : '▶️'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                const idx = playlist.findIndex(t => t.id === currentTrack.id);
                                handlePlay(playlist[(idx + 1) % playlist.length]);
                            }}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                fontSize: '1.3rem', cursor: 'pointer',
                            }}
                        >
                            ⏭️
                        </motion.button>
                    </div>
                </div>
            </Card>

            {/* Playlist */}
            <div style={{ marginTop: 'var(--space-6)' }}>
                <h4 style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 'var(--space-3)',
                }}>
                    Love Songs Playlist
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {playlist.map((track, i) => (
                        <motion.div
                            key={track.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ x: 4 }}
                            onClick={() => handlePlay(track)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: '10px var(--space-3)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                background: currentTrack.id === track.id
                                    ? 'rgba(242, 167, 195, 0.08)'
                                    : 'transparent',
                                transition: 'background 0.15s ease',
                            }}
                        >
                            <span style={{
                                width: '28px',
                                textAlign: 'center',
                                fontSize: currentTrack.id === track.id ? '1.1rem' : '0.8rem',
                                color: currentTrack.id === track.id ? 'var(--accent-pink)' : 'var(--text-muted)',
                            }}>
                                {currentTrack.id === track.id && isPlaying ? '🎵' : track.emoji}
                            </span>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    color: currentTrack.id === track.id ? 'var(--accent-pink)' : 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    margin: 0,
                                    fontWeight: currentTrack.id === track.id ? 500 : 400,
                                }}>
                                    {track.title}
                                </p>
                                <p style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.75rem',
                                    margin: 0,
                                }}>
                                    {track.artist}
                                </p>
                            </div>
                            <span style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-mono)',
                            }}>
                                {track.duration}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default MusicPlayer;
