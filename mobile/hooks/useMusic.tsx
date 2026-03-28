import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';

interface Track {
    youtubeId: string;
    title: string;
    channel: string;
    thumbnail: string;
    duration?: string;
}

interface MusicContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playerReady: boolean;
    queue: Track[];
    playTrack: (track: Track) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    addToQueue: (track: Track) => void;
    removeFromQueue: (index: number) => void;
    setPlayerReady: (ready: boolean) => void;
    onStateChange: (state: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const { socket } = useSocket();
    const { session } = useAuth();

    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const [queue, setQueue] = useState<Track[]>([]);

    const currentTrackRef = useRef(currentTrack);
    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    const emitSync = useCallback((statePlaying: boolean, track: Track | null) => {
        if (socket && session) {
            socket.emit('music:state_sync', {
                roomId: session.room.id,
                isPlaying: statePlaying,
                track: track,
                senderRole: session.user.role,
            });
        }
    }, [socket, session]);

    // On connection or session ready, request a sync from partner
    useEffect(() => {
        if (socket && session) {
            console.log('🎵 Requesting music sync from room partner...');
            socket.emit('music:request_sync', {
                roomId: session.room.id,
                requesterRole: session.user.role,
            });
        }
    }, [socket, session]);

    // Listen to remote changes
    useEffect(() => {
        if (!socket || !session) return;
        
        const handleSync = (data: { isPlaying: boolean; track: Track | null; senderRole: string }) => {
            console.log(`🎵 Received music sync from ${data.senderRole}: playing=${data.isPlaying}`);
            if (data.track) {
                // To avoid reloading the iframe unnecessarily, check if it's the exact same track
                setCurrentTrack(prev => {
                    if (prev?.youtubeId !== data.track?.youtubeId) {
                        setPlayerReady(false);
                        return data.track;
                    }
                    return prev;
                });
            } else if (data.track === null) {
                setCurrentTrack(null);
            }
            setIsPlaying(data.isPlaying); // Always sync playing state
        };

        const handleSyncRequest = (data: { roomId: number; requesterRole: string }) => {
            if (currentTrackRef.current && session) {
                console.log(`🎵 ${data.requesterRole} requested sync. Sending my state...`);
                socket.emit('music:state_sync', {
                    roomId: session.room.id,
                    isPlaying: isPlayingRef.current,
                    track: currentTrackRef.current,
                    senderRole: session.user.role,
                });
            }
        };

        socket.on('music:state_sync', handleSync);
        socket.on('music:request_sync', handleSyncRequest);
        return () => {
            socket.off('music:state_sync', handleSync);
            socket.off('music:request_sync', handleSyncRequest);
        };
    }, [socket, session]);

    const playTrack = useCallback((track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        setPlayerReady(false);
        emitSync(true, track);
    }, [emitSync]);

    const addToQueue = useCallback((track: Track) => {
        setQueue(prev => [...prev, track]);
    }, []);

    const removeFromQueue = useCallback((index: number) => {
        setQueue(prev => prev.filter((_, idx) => idx !== index));
    }, []);

    const playNext = useCallback(() => {
        setQueue(prev => {
            if (prev.length > 0) {
                const [next, ...rest] = prev;
                setCurrentTrack(next);
                setIsPlaying(true);
                setPlayerReady(false);
                emitSync(true, next);
                return rest;
            } else {
                setCurrentTrack(null);
                setIsPlaying(false);
                emitSync(false, null);
                return prev;
            }
        });
    }, [emitSync]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => {
            const nextState = !prev;
            emitSync(nextState, currentTrack);
            return nextState;
        });
    }, [emitSync, currentTrack]);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            playNext();
        }
        if (state === 'playing') {
            setPlayerReady(true);
        }
    }, [playNext]);

    return (
        <MusicContext.Provider value={{
            currentTrack, isPlaying, playerReady, queue,
            playTrack, togglePlayPause, playNext, addToQueue, removeFromQueue,
            setPlayerReady, onStateChange,
        }}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) throw new Error('useMusic must be used within MusicProvider');
    return context;
}
