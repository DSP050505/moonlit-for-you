import { useEffect, useRef, useCallback } from 'react';

// Simple synth sounds so we don't need actual audio files
export const useSound = () => {
    const playHover = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { }
    }, []);

    const playClick = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { }
    }, []);

    const playSuccess = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            const playNote = (freq: number, startTime: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(startTime);
                osc.stop(startTime + 0.3);
            };

            playNote(440, ctx.currentTime);       // A4
            playNote(554.37, ctx.currentTime + 0.1); // C#5
            playNote(659.25, ctx.currentTime + 0.2); // E5
        } catch(e) {}
    }, []);

    return { playHover, playClick, playSuccess };
};
