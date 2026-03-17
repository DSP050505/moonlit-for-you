import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from './AuthContext';

/* ─── Types ─── */
export interface MusicTrack {
    youtubeId: string;
    title: string;
    channel: string;
    thumbnail: string;
}

interface MusicContextType {
    currentTrack: MusicTrack | null;
    isPlaying: boolean;
    progress: number;
    duration: number;
    queue: MusicTrack[];
    playTrack: (track: MusicTrack, broadcast?: boolean) => void;
    togglePlayPause: (broadcast?: boolean) => void;
    addToQueue: (track: MusicTrack, broadcast?: boolean) => void;
    playNextInQueue: () => void;
    seekTo: (seconds: number) => void;
    setQueue: React.Dispatch<React.SetStateAction<MusicTrack[]>>;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusicPlayer() {
    const ctx = useContext(MusicContext);
    if (!ctx) throw new Error('useMusicPlayer must be used inside MusicProvider');
    return ctx;
}

/* ─── YouTube IFrame API Loader ─── */
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

/* ═══════════════════════════════════
   Music Provider
   ═══════════════════════════════════ */
export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const { session } = useAuth();

    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [queue, setQueue] = useState<MusicTrack[]>([]);

    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement | null>(null);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const roomId = session?.room.id;

    /* Ensure the hidden div for YouTube player exists */
    useEffect(() => {
        loadYouTubeAPI();
        if (!playerContainerRef.current) {
            const div = document.createElement('div');
            div.id = 'yt-player-host';
            div.style.position = 'absolute';
            div.style.width = '0';
            div.style.height = '0';
            div.style.overflow = 'hidden';
            document.body.appendChild(div);
            playerContainerRef.current = div;
        }
        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
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

    /* ─── Create YouTube Player ─── */
    const createPlayer = useCallback((videoId: string) => {
        if (!playerContainerRef.current) return;

        if (playerRef.current) {
            try { playerRef.current.destroy(); } catch { /* ignore */ }
            playerRef.current = null;
        }

        const playerDiv = document.createElement('div');
        playerDiv.id = 'yt-player-' + Date.now();
        playerContainerRef.current.innerHTML = '';
        playerContainerRef.current.appendChild(playerDiv);

        playerRef.current = new (window as any).YT.Player(playerDiv.id, {
            height: '0',
            width: '0',
            videoId,
            playerVars: { autoplay: 1, controls: 0, disablekb: 1, modestbranding: 1, playsinline: 1 },
            events: {
                onReady: (e: any) => {
                    e.target.playVideo();
                    setIsPlaying(true);
                    setDuration(e.target.getDuration() || 0);
                    startProgressTracker();
                },
                onStateChange: (e: any) => {
                    const YT = (window as any).YT;
                    if (e.data === YT.PlayerState.ENDED) playNextInQueueRef.current();
                    if (e.data === YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        setDuration(e.target.getDuration() || 0);
                    }
                    if (e.data === YT.PlayerState.PAUSED) setIsPlaying(false);
                },
            },
        });
    }, [startProgressTracker]);

    /* ─── Play a track ─── */
    const playTrack = useCallback(async (track: MusicTrack, broadcast = true) => {
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

    /* ─── Toggle play/pause ─── */
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

    /* ─── Seek ─── */
    const seekTo = useCallback((seconds: number) => {
        if (!playerRef.current) return;
        playerRef.current.seekTo(seconds, true);
        if (socket && roomId) {
            socket.emit('music:sync', { action: 'seek', position: seconds });
        }
    }, [socket, roomId]);

    /* ─── Queue ─── */
    const addToQueue = useCallback((track: MusicTrack, broadcast = true) => {
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

    // Ref so onStateChange can call latest version
    const playNextInQueueRef = useRef(playNextInQueue);
    useEffect(() => { playNextInQueueRef.current = playNextInQueue; }, [playNextInQueue]);

    /* ─── Socket Listeners ─── */
    useEffect(() => {
        if (!socket) return;

        const onTrackChange = (data: any) => {
            console.log('🎵 Partner changed track:', data.title);
            playTrack({
                youtubeId: data.youtubeId,
                title: data.title,
                channel: data.channel || '',
                thumbnail: data.thumbnail || '',
            }, false);
        };

        const onSync = (data: any) => {
            console.log('🎵 Music sync:', data.action);
            if (data.action === 'pause' && playerRef.current) playerRef.current.pauseVideo();
            if (data.action === 'play' && playerRef.current) playerRef.current.playVideo();
            if (data.action === 'seek' && playerRef.current && data.position !== undefined) {
                playerRef.current.seekTo(data.position, true);
            }
        };

        const onQueueAdd = (data: any) => {
            console.log('🎵 Partner queued:', data.title);
            setQueue(prev => [...prev, {
                youtubeId: data.youtubeId,
                title: data.title,
                channel: data.channel || '',
                thumbnail: data.thumbnail || '',
            }]);
        };

        socket.on('music:trackChange', onTrackChange);
        socket.on('music:sync', onSync);
        socket.on('music:queueAdd', onQueueAdd);

        return () => {
            socket.off('music:trackChange', onTrackChange);
            socket.off('music:sync', onSync);
            socket.off('music:queueAdd', onQueueAdd);
        };
    }, [socket, playTrack]);

    const value: MusicContextType = {
        currentTrack, isPlaying, progress, duration, queue,
        playTrack, togglePlayPause, addToQueue, playNextInQueue, seekTo, setQueue,
    };

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
};
