import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../shared/Card';
import VinylRecord3D from '../3d/VinylRecord3D';
import { useAuth } from '../../context/AuthContext';
import { useMusicPlayer } from '../../context/MusicContext';
import type { MusicTrack } from '../../context/MusicContext';

/* ─── Types ─── */
interface SearchResult extends MusicTrack {}

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

const API = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`);

/* ═══════════════════════════════════
   Music Player Page (uses MusicContext)
   ═══════════════════════════════════ */
const MusicPlayer: React.FC = () => {
    const { session } = useAuth();
    const {
        currentTrack, isPlaying, progress, duration, queue,
        playTrack, togglePlayPause, addToQueue, playNextInQueue, seekTo, setQueue,
    } = useMusicPlayer();

    const [activeTab, setActiveTab] = useState<Tab>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<SearchResult | null>(null);

    const userRole = session?.user.role || 'unknown';
    const roomId = session?.room.id;

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

    useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

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
        } catch (err) { console.error('Failed to create playlist:', err); }
    };

    const addTrackToPlaylist = async (playlistId: number, track: SearchResult) => {
        try {
            await fetch(`${API}/api/music/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    youtubeId: track.youtubeId, title: track.title,
                    channel: track.channel, thumbnail: track.thumbnail, addedBy: userRole,
                }),
            });
            setAddToPlaylistTrack(null);
            fetchPlaylists();
        } catch (err) { console.error('Failed to add track:', err); }
    };

    const removeTrack = async (playlistId: number, trackId: number) => {
        try {
            await fetch(`${API}/api/music/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' });
            fetchPlaylists();
        } catch (err) { console.error('Failed to remove track:', err); }
    };

    /* ─── Format time ─── */
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    const currentTime = duration > 0 ? (progress / 100) * duration : 0;

    /* ═══════════ RENDER ═══════════ */
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--space-4)' }}
            className="music-container"
        >
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                🎵 Our Music
            </h2>

            {/* ── Now Playing ── */}
            {currentTrack && (
                <Card glow hover3D={false}>
                    <div style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <div
                            style={{
                                width: '120px', height: '120px', flexShrink: 0, position: 'relative',
                                marginLeft: '-10px'
                            }}
                        >
                            <VinylRecord3D imageUrl={currentTrack.thumbnail} isPlaying={isPlaying} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentTrack.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>{currentTrack.channel}</p>
                            <div
                                style={{ height: '4px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', margin: '10px 0 6px 0', cursor: 'pointer', position: 'relative' }}
                                onClick={(e) => {
                                    if (!duration) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    seekTo(((e.clientX - rect.left) / rect.width) * duration);
                                }}
                            >
                                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-pink))', borderRadius: 'var(--radius-pill)', transition: 'width 0.3s linear' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => togglePlayPause()}
                                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={playNextInQueue}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer' }}>
                                        ⏭️
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', margin: 'var(--space-5) 0' }}>
                {(['search', 'queue', 'playlists'] as Tab[]).map(tab => (
                    <motion.button key={tab} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 20px', borderRadius: 'var(--radius-pill)', border: 'none',
                            background: activeTab === tab ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))' : 'var(--bg-surface)',
                            color: activeTab === tab ? 'var(--bg-primary)' : 'var(--text-muted)',
                            cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.85rem',
                        }}>
                        {tab === 'search' ? '🔍 Search' : tab === 'queue' ? `📋 Queue (${queue.length})` : '💿 Playlists'}
                    </motion.button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
                {/* SEARCH */}
                {activeTab === 'search' && (
                    <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search for any song..."
                                style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-pill)', padding: '10px 16px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
                            />
                            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSearch} disabled={isSearching}
                                style={{ padding: '10px 18px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))', border: 'none', color: 'var(--bg-primary)', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.85rem' }}>
                                {isSearching ? '...' : '🔍'}
                            </motion.button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {searchResults.map((r, i) => (
                                <motion.div key={r.youtubeId + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '8px var(--space-3)', borderRadius: 'var(--radius-sm)', background: currentTrack?.youtubeId === r.youtubeId ? 'rgba(242,167,195,0.1)' : 'transparent' }}>
                                    <img src={r.thumbnail} alt="" style={{ width: '48px', height: '36px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {r.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0 }}>{r.channel}</p>
                                    </div>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => playTrack(r)} title="Play" style={abtn}>▶️</motion.button>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => addToQueue(r)} title="Queue" style={abtn}>📋</motion.button>
                                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setAddToPlaylistTrack(r)} title="Playlist" style={abtn}>💿</motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* QUEUE */}
                {activeTab === 'queue' && (
                    <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {queue.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🎶</p>
                                <p>Queue is empty. Search and add songs!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {queue.map((t, i) => (
                                    <div key={t.youtubeId + i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '8px var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: '20px' }}>{i + 1}</span>
                                        <img src={t.thumbnail} alt="" style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {t.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                            </p>
                                        </div>
                                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQueue(prev => prev.filter((_, idx) => idx !== i))} style={abtn}>❌</motion.button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* PLAYLISTS */}
                {activeTab === 'playlists' && (
                    <motion.div key="playlists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {showCreatePlaylist ? (
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createPlaylist()} placeholder="Playlist name..."
                                    style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-pill)', padding: '8px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
                                />
                                <motion.button whileTap={{ scale: 0.9 }} onClick={createPlaylist}
                                    style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-pink))', border: 'none', color: 'var(--bg-primary)', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.8rem' }}>
                                    Create
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreatePlaylist(true)}
                                style={{ width: '100%', padding: '10px', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>
                                + New Playlist
                            </motion.button>
                        )}
                        {playlists.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-6)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>💿</p>
                                <p>No playlists yet. Create one!</p>
                            </div>
                        ) : (
                            playlists.map(pl => (
                                <div key={pl.id} style={{ marginBottom: 'var(--space-4)' }}>
                                    <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-pink)', fontSize: '0.95rem', marginBottom: 'var(--space-2)' }}>
                                        {pl.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({pl.tracks.length} songs)</span>
                                    </h4>
                                    {pl.tracks.map(track => (
                                        <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
                                            <img src={track.thumbnail} alt="" style={{ width: '36px', height: '27px', borderRadius: '3px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ color: 'var(--text-primary)', fontSize: '0.8rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {track.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                                </p>
                                            </div>
                                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => playTrack({ youtubeId: track.youtubeId, title: track.title, channel: track.channel, thumbnail: track.thumbnail })} style={abtn}>▶️</motion.button>
                                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeTrack(pl.id, track.id)} style={abtn}>🗑️</motion.button>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setAddToPlaylistTrack(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}
                            style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', padding: 'var(--space-6)', width: '90%', maxWidth: '360px', border: 'var(--glass-border)' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Add to Playlist</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 'var(--space-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {addToPlaylistTrack.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                            </p>
                            {playlists.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No playlists yet. Create one first!</p>
                            ) : (
                                playlists.map(pl => (
                                    <motion.button key={pl.id} whileTap={{ scale: 0.95 }} onClick={() => addTrackToPlaylist(pl.id, addToPlaylistTrack)}
                                        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: 'var(--space-2)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', textAlign: 'left' }}>
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

const abtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '4px', flexShrink: 0 };

export default MusicPlayer;
