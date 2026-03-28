import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

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
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const [queue, setQueue] = useState<Track[]>([]);

    const playTrack = useCallback((track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        setPlayerReady(false);
    }, []);

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
                return rest;
            } else {
                setCurrentTrack(null);
                setIsPlaying(false);
                return prev;
            }
        });
    }, []);

    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

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
