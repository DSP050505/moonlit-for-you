import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/useSocket';

/* ─── Types ─── */
interface SearchResult {
    youtubeId: string;
    title: string;
    channel: string;
    thumbnail: string;
}

interface PlaylistData {
    id: number;
    name: string;
    createdBy: string;
    tracks: PlaylistTrackData[];
}

interface PlaylistTrackData {
    id: number;
    youtubeId: string;
    title: string;
    channel: string;
    thumbnail: string;
    duration: string;
    addedBy: string;
}

type Tab = 'search' | 'queue' | 'playlists';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ─── YouTube IFrame API loader ─── */
let ytReady = false;
let ytReadyPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
    if (ytReady) return Promise.resolve();
    if (ytReadyPromise) return ytReadyPromise;

    ytReadyPromise = new Promise<void>((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) {
            ytReady = true;
            resolve();
            return;
        }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
        (window as any).onYouTubeIframeAPIReady = () => {
            ytReady = true;
            resolve();
        };
    });
    return ytReadyPromise;
}

/* ═════════════════════════════════════
   Music Player Component
   ═════════════════════════════════════ */
const MusicPlayer: React.FC = () => {
    const { session } = useAuth();
    const { socket } = useSocket();

    /* State */
    const [activeTab, setActiveTab] = useState<Tab>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<SearchResult | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [queue, setQueue] = useState<SearchResult[]>([]);
    const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<SearchResult | null>(null);

    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const isSyncingRef = useRef(false);

    const userRole = session?.user.role || 'unknown';
    const roomId = session?.room.id;

    /* ─── Load YouTube Player ─── */
    useEffect(() => {
        loadYouTubeAPI();
    }, []);

    /* ─── Fetch playlists ─── */
    const fetchPlaylists = useCallback(async () => {
        if (!roomId) return;
        try {
            const res = await fetch(`${API}/api/music/playlists?roomId=${roomId}`);
            const data = await res.json();
            if (data.playlists) setPlaylists(data.playlists);
        } catch (err) {
            console.error('Failed to fetch playlists:', err);
        }
    }, [roomId]);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    /* ─── Create YouTube Player in DOM ─── */
    const createPlayer = useCallback((videoId: string) => {
        if (!playerContainerRef.current) return;

        // Destroy previous player
        if (playerRef.current) {
            try { playerRef.current.destroy(); } catch { /* ignore */ }
            playerRef.current = null;
        }

        // Create fresh div for player
        const playerDiv = document.createElement('div');
        playerDiv.id = 'yt-player-' + Date.now();
        playerContainerRef.current.innerHTML = '';
        playerContainerRef.current.appendChild(playerDiv);

        playerRef.current = new (window as any).YT.Player(playerDiv.id, {
            height: '0',
            width: '0',
            videoId,
            playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                playsinline: 1,
            },
            events: {
                onReady: (event: any) => {
                    event.target.playVideo();
                    setIsPlaying(true);
                    setDuration(event.target.getDuration() || 0);
                    startProgressTracker();
                },
                onStateChange: (event: any) => {
                    const YT = (window as any).YT;
                    if (event.data === YT.PlayerState.ENDED) {
                        playNextInQueue();
                    }
                    if (event.data === YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        setDuration(event.target.getDuration() || 0);
                    }
                    if (event.data === YT.PlayerState.PAUSED) {
                        setIsPlaying(false);
                    }
                },
            },
        });
    }, []);

    /* ─── Progress Tracker ─── */
    const startProgressTracker = useCallback(() => {
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            if (playerRef.current?.getCurrentTime && playerRef.current?.getDuration) {
                const current = playerRef.current.getCurrentTime();
                const total = playerRef.current.getDuration();
                if (total > 0) {
                    setProgress((current / total) * 100);
                    setDuration(total);
                }
            }
        }, 500);
    }, []);

    useEffect(() => {
        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, []);

    /* ─── Play a track ─── */
    const playTrack = useCallback(async (track: SearchResult, broadcast = true) => {
        setCurrentTrack(track);

        await loadYouTubeAPI();
        createPlayer(track.youtubeId);

        if (broadcast && socket && roomId) {
            socket.emit('music:trackChange', {
                youtubeId: track.youtubeId,
                title: track.title,
                channel: track.channel,
                thumbnail: track.thumbnail,
            });
        }
    }, [socket, roomId, createPlayer]);

    /* ─── Play/Pause ─── */
    const togglePlayPause = useCallback((broadcast = true) => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
        if (broadcast && socket && roomId) {
            socket.emit('music:sync', {
                action: isPlaying ? 'pause' : 'play',
                youtubeId: currentTrack?.youtubeId,
                title: currentTrack?.title,
            });
        }
    }, [isPlaying, socket, roomId, currentTrack]);

    /* ─── Queue management ─── */
    const addToQueue = useCallback((track: SearchResult, broadcast = true) => {
        setQueue(prev => [...prev, track]);
        if (broadcast && socket && roomId) {
            socket.emit('music:queueAdd', {
                youtubeId: track.youtubeId,
                title: track.title,
                channel: track.channel,
                thumbnail: track.thumbnail,
            });
        }
    }, [socket, roomId]);

    const playNextInQueue = useCallback(() => {
        setQueue(prev => {
            if (prev.length === 0) return prev;
            const [next, ...rest] = prev;
            playTrack(next);
            return rest;
        });
    }, [playTrack]);

    /* ─── Socket Listeners ─── */
    useEffect(() => {
        if (!socket) return;

        socket.on('music:trackChange', (data: any) => {
            console.log('🎵 Partner changed track:', data.title);
            isSyncingRef.current = true;
            playTrack({
                youtubeId: data.youtubeId,
                title: data.title,
                channel: data.channel || '',
                thumbnail: data.thumbnail || '',
            }, false);
            setTimeout(() => { isSyncingRef.current = false; }, 500);
        });

        socket.on('music:sync', (data: any) => {
            console.log('🎵 Music sync from partner:', data.action);
            if (data.action === 'pause' && playerRef.current) {
                playerRef.current.pauseVideo();
            }
            if (data.action === 'play' && playerRef.current) {
                playerRef.current.playVideo();
            }
            if (data.action === 'seek' && playerRef.current && data.position !== undefined) {
                playerRef.current.seekTo(data.position, true);
            }
        });

        socket.on('music:queueAdd', (data: any) => {
            console.log('🎵 Partner added to queue:', data.title);
            setQueue(prev => [...prev, {
                youtubeId: data.youtubeId,
                title: data.title,
                channel: data.channel || '',
                thumbnail: data.thumbnail || '',
            }]);
        });

        return () => {
            socket.off('music:trackChange');
            socket.off('music:sync');
            socket.off('music:queueAdd');
        };
    }, [socket, playTrack]);

    /* ─── Search ─── */
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`${API}/api/music/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch (err) {
            console.error('Search failed:', err);
        }
        setIsSearching(false);
    };

    /* ─── Playlist CRUD ─── */
    const createPlaylist = async () => {
        if (!newPlaylistName.trim() || !roomId) return;
        try {
            await fetch(`${API}/api/music/playlists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, name: newPlaylistName, createdBy: userRole }),
            });
            setNewPlaylistName('');
            setShowCreatePlaylist(false);
            fetchPlaylists();
        } catch (err) {
            console.error('Failed to create playlist:', err);
        }
    };

    const addTrackToPlaylist = async (playlistId: number, track: SearchResult) => {
        try {
            await fetch(`${API}/api/music/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    youtubeId: track.youtubeId,
                    title: track.title,
                    channel: track.channel,
                    thumbnail: track.thumbnail,
                    addedBy: userRole,
                }),
            });
            setAddToPlaylistTrack(null);
            fetchPlaylists();
        } catch (err) {
            console.error('Failed to add track:', err);
        }
    };

    const removeTrack = async (playlistId: number, trackId: number) => {
        try {
            await fetch(`${API}/api/music/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' });
            fetchPlaylists();
        } catch (err) {
            console.error('Failed to remove track:', err);
        }
    };

    /* ─── Format time ─── */
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentTime = duration > 0 ? (progress / 100) * duration : 0;

    /* ═════════════ RENDER ═════════════ */
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
                🎵 Our Music
            </h2>

            {/* Hidden YouTube Player */}
            <div ref={playerContainerRef} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />

            {/* ── Now Playing Card ── */}
            {currentTrack && (
                <Card glow hover3D={false}>
                    <div style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                        {/* Thumbnail */}
                        <motion.div
                            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                            transition={isPlaying ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid var(--accent-pink)',
                                boxShadow: isPlaying ? '0 0 20px var(--glow)' : 'none',
                                flexShrink: 0,
                            }}
                        >
                            <img
                                src={currentTrack.thumbnail}
                                alt={currentTrack.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </motion.div>

                        {/* Info + Controls */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {currentTrack.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
                                {currentTrack.channel}
                            </p>

                            {/* Progress Bar */}
                            <div
                                style={{
                                    height: '4px',
                                    background: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-pill)',
                                    margin: '10px 0 6px 0',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                                onClick={(e) => {
                                    if (!playerRef.current || !duration) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = (e.clientX - rect.left) / rect.width;
                                    const seekTo = pct * duration;
                                    playerRef.current.seekTo(seekTo, true);
                                    if (socket && roomId) {
                                        socket.emit('music:sync', { action: 'seek', position: seekTo });
                                    }
                                }}
                            >
                                <div style={{
                                    height: '100%',
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-pink))',
                                    borderRadius: 'var(--radius-pill)',
                                    transition: 'width 0.3s linear',
                                }} />
                            </div>

                            {/* Time + Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => togglePlayPause()}
                                        style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                            border: 'none', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                        }}
                                    >
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={playNextInQueue}
                                        style={{
                                            background: 'none', border: 'none', color: 'var(--text-muted)',
                                            fontSize: '1.1rem', cursor: 'pointer',
                                        }}
                                    >
                                        ⏭️
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* ── Tab Navigation ── */}
            <div style={{
                display: 'flex', gap: 'var(--space-2)', justifyContent: 'center',
                margin: 'var(--space-5) 0',
            }}>
                {(['search', 'queue', 'playlists'] as Tab[]).map(tab => (
                    <motion.button
                        key={tab}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 'var(--radius-pill)',
                            border: 'none',
                            background: activeTab === tab
                                ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))'
                                : 'var(--bg-surface)',
                            color: activeTab === tab ? 'var(--bg-primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 500,
                            fontSize: '0.85rem',
                        }}
                    >
                        {tab === 'search' ? '🔍 Search' : tab === 'queue' ? `📋 Queue (${queue.length})` : '💿 Playlists'}
                    </motion.button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
                {/* ──── SEARCH TAB ──── */}
                {activeTab === 'search' && (
                    <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Search Bar */}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search for any song..."
                                style={{
                                    flex: 1,
                                    background: 'var(--bg-surface)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 'var(--radius-pill)',
                                    padding: '10px 16px',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.9rem',
                                }}
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSearch}
                                disabled={isSearching}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 'var(--radius-pill)',
                                    background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                    border: 'none',
                                    color: 'var(--bg-primary)',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                }}
                            >
                                {isSearching ? '...' : '🔍'}
                            </motion.button>
                        </div>

                        {/* Search Results */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {searchResults.map((result, i) => (
                                <motion.div
                                    key={result.youtubeId + i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                        padding: '8px var(--space-3)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: currentTrack?.youtubeId === result.youtubeId ? 'rgba(242,167,195,0.1)' : 'transparent',
                                    }}
                                >
                                    <img src={result.thumbnail} alt="" style={{
                                        width: '48px', height: '36px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0,
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            color: 'var(--text-primary)', fontSize: '0.85rem', margin: 0,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {result.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0 }}>
                                            {result.channel}
                                        </p>
                                    </div>
                                    {/* Action Buttons */}
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => playTrack(result)}
                                        title="Play now" style={actionBtnStyle}>
                                        ▶️
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => addToQueue(result)}
                                        title="Add to queue" style={actionBtnStyle}>
                                        📋
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setAddToPlaylistTrack(result)}
                                        title="Add to playlist" style={actionBtnStyle}>
                                        💿
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ──── QUEUE TAB ──── */}
                {activeTab === 'queue' && (
                    <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {queue.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🎶</p>
                                <p>Queue is empty. Search and add songs!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {queue.map((track, i) => (
                                    <motion.div
                                        key={track.youtubeId + i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                            padding: '8px var(--space-3)', borderRadius: 'var(--radius-sm)',
                                        }}
                                    >
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: '20px' }}>{i + 1}</span>
                                        <img src={track.thumbnail} alt="" style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {track.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                            </p>
                                        </div>
                                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQueue(prev => prev.filter((_, idx) => idx !== i))}
                                            style={actionBtnStyle}>
                                            ❌
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ──── PLAYLISTS TAB ──── */}
                {activeTab === 'playlists' && (
                    <motion.div key="playlists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Create Playlist */}
                        {showCreatePlaylist ? (
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
                                    placeholder="Playlist name..."
                                    style={{
                                        flex: 1, background: 'var(--bg-surface)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 'var(--radius-pill)',
                                        padding: '8px 14px', color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                                    }}
                                />
                                <motion.button whileTap={{ scale: 0.9 }} onClick={createPlaylist}
                                    style={{
                                        padding: '8px 16px', borderRadius: 'var(--radius-pill)',
                                        background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))',
                                        border: 'none', color: 'var(--bg-primary)', cursor: 'pointer',
                                        fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
                                    }}>
                                    Create
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreatePlaylist(true)}
                                style={{
                                    width: '100%', padding: '10px', marginBottom: 'var(--space-4)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-surface)',
                                    border: '1px dashed rgba(255,255,255,0.1)',
                                    color: 'var(--text-muted)', cursor: 'pointer',
                                    fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                                }}>
                                + New Playlist
                            </motion.button>
                        )}

                        {/* Playlist List */}
                        {playlists.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-6)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>💿</p>
                                <p>No playlists yet. Create one!</p>
                            </div>
                        ) : (
                            playlists.map(pl => (
                                <div key={pl.id} style={{ marginBottom: 'var(--space-4)' }}>
                                    <h4 style={{
                                        fontFamily: 'var(--font-heading)',
                                        color: 'var(--accent-pink)',
                                        fontSize: '0.95rem',
                                        marginBottom: 'var(--space-2)',
                                    }}>
                                        {pl.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({pl.tracks.length} songs)</span>
                                    </h4>
                                    {pl.tracks.map(track => (
                                        <div key={track.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            padding: '6px var(--space-2)', borderRadius: 'var(--radius-sm)',
                                        }}>
                                            <img src={track.thumbnail} alt="" style={{ width: '36px', height: '27px', borderRadius: '3px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ color: 'var(--text-primary)', fontSize: '0.8rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {track.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                                </p>
                                            </div>
                                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => playTrack({
                                                youtubeId: track.youtubeId, title: track.title,
                                                channel: track.channel, thumbnail: track.thumbnail,
                                            })} style={actionBtnStyle}>
                                                ▶️
                                            </motion.button>
                                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeTrack(pl.id, track.id)} style={actionBtnStyle}>
                                                🗑️
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Add to Playlist Modal ── */}
            <AnimatePresence>
                {addToPlaylistTrack && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setAddToPlaylistTrack(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(6px)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-card)',
                                padding: 'var(--space-6)',
                                width: '90%', maxWidth: '360px',
                                border: 'var(--glass-border)',
                            }}
                        >
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                marginBottom: 'var(--space-4)',
                            }}>
                                Add to Playlist
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 'var(--space-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {addToPlaylistTrack.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                            </p>

                            {playlists.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No playlists yet. Create one in the Playlists tab first!</p>
                            ) : (
                                playlists.map(pl => (
                                    <motion.button
                                        key={pl.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => addTrackToPlaylist(pl.id, addToPlaylistTrack)}
                                        style={{
                                            display: 'block', width: '100%', padding: '10px',
                                            marginBottom: 'var(--space-2)',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'var(--bg-surface)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            color: 'var(--text-primary)', cursor: 'pointer',
                                            fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
                                            textAlign: 'left',
                                        }}
                                    >
                                        💿 {pl.name}
                                    </motion.button>
                                ))
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* ─── Shared button style ─── */
const actionBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '4px',
    flexShrink: 0,
};

export default MusicPlayer;
