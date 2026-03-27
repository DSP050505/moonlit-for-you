import { Router } from 'express';
import prisma from '../db/database';

const router = Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Cache for Invidious instances
let cachedInstances: string[] = [];
let lastInstanceFetch = 0;

// Reliable Piped instances as fallback
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.syncpundit.io'
];

async function getInvidiousInstances(): Promise<string[]> {
    const now = Date.now();
    // Refresh cache every hour
    if (cachedInstances.length > 0 && now - lastInstanceFetch < 3600000) {
        return cachedInstances;
    }

    try {
        console.log('🔄 Fetching active Invidious instances...');
        const res = await fetch('https://api.invidious.io/instances.json?sort_by=health');
        const data: any = await res.json();
        
        // Filter for HTTPS, API enabled, and good health
        const active = data
            .map((item: any) => item[1])
            .filter((inst: any) => inst.type === 'https' && inst.api === true)
            .map((inst: any) => inst.uri)
            .slice(0, 10); // Take top 10 healthiest

        if (active.length > 0) {
            cachedInstances = active;
            lastInstanceFetch = now;
            console.log(`✅ Loaded ${active.length} Invidious instances`);
            return active;
        }
    } catch (e: any) {
        console.error('❌ Failed to fetch Invidious instances:', e.message);
    }

    // Hardcoded fallback if API fails
    return [
        'https://inv.nadeko.net',
        'https://invidious.protokolla.fi',
        'https://invidious.privacyredirect.com',
        'https://iv.nbohr.land'
    ];
}

// ─── Get audio stream URL via Invidious / Piped API ───
router.get('/stream/:youtubeId', async (req, res) => {
    const { youtubeId } = req.params;
    if (!youtubeId) {
        return res.status(400).json({ error: 'Missing youtubeId' });
    }

    console.log(`🎵 Getting audio stream for: ${youtubeId}`);
    
    // 1. Try Invidious Instances
    const instances = await getInvidiousInstances();
    for (const instance of instances) {
        try {
            const url = `${instance}/api/v1/videos/${youtubeId}`;
            console.log(`   [Invidious] Trying: ${instance}...`);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
            clearTimeout(timeout);

            if (!response.ok) continue;

            const data: any = await response.json();
            const audioFormats = (data.adaptiveFormats || [])
                .filter((f: any) => f.type?.startsWith('audio/'))
                .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

            if (audioFormats.length > 0) {
                const best = audioFormats[0];
                console.log(`✅ Success via ${instance}`);
                return res.json({
                    audioUrl: best.url,
                    mimeType: best.type,
                    duration: data.lengthSeconds || 0,
                    title: data.title || '',
                });
            }
        } catch (err) { /* ignore and try next */ }
    }

    // 2. Fallback to Piped API
    console.log(`   ⚠️ All Invidious failed. Falling back to Piped API...`);
    for (const instance of PIPED_INSTANCES) {
        try {
            const url = `${instance}/streams/${youtubeId}`;
            console.log(`   [Piped] Trying: ${instance}...`);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            if (!response.ok) continue;

            const data: any = await response.json();
            const audioStreams = data.audioStreams || [];
            
            // Sort by bitrate descending
            audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate);

            if (audioStreams.length > 0) {
                const best = audioStreams[0];
                console.log(`✅ Success via ${instance}`);
                return res.json({
                    audioUrl: best.url,
                    mimeType: best.mimeType,
                    duration: data.duration || 0,
                    title: data.title || '',
                });
            }
        } catch (err) { /* ignore and try next */ }
    }

    console.error(`❌ ALL stream sources failed for ${youtubeId}`);
    res.status(502).json({ error: 'Failed to get audio stream from all sources' });
});

// ─── YouTube Search Proxy (keeps API key safe on server) ───
router.get('/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
        return res.status(400).json({ error: 'Missing search query' });
    }

    if (!YOUTUBE_API_KEY) {
        console.error('❌ YOUTUBE_API_KEY not set');
        return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    try {
        console.log(`🔍 YouTube search: "${query}"`);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(url);
        const data: any = await response.json();

        if (data.error) {
            console.error('❌ YouTube API error:', data.error.message);
            return res.status(500).json({ error: data.error.message });
        }

        const results = (data.items || []).map((item: any) => ({
            youtubeId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            publishedAt: item.snippet.publishedAt,
        }));

        console.log(`✅ Found ${results.length} results for "${query}"`);
        res.json({ results });
    } catch (err) {
        console.error('❌ YouTube search error:', err);
        res.status(500).json({ error: 'Failed to search YouTube' });
    }
});

// ─── Get all playlists for a room ───
router.get('/playlists', async (req, res) => {
    const roomId = parseInt(req.query.roomId as string);
    if (!roomId) return res.status(400).json({ error: 'Missing roomId' });

    try {
        const playlists = await prisma.playlist.findMany({
            where: { roomId },
            include: { tracks: { orderBy: { addedAt: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ playlists });
    } catch (err) {
        console.error('❌ Error fetching playlists:', err);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

// ─── Create a playlist ───
router.post('/playlists', async (req, res) => {
    const { roomId, name, createdBy } = req.body;
    if (!roomId || !name || !createdBy) {
        return res.status(400).json({ error: 'Missing roomId, name, or createdBy' });
    }

    try {
        const playlist = await prisma.playlist.create({
            data: { roomId, name, createdBy },
            include: { tracks: true },
        });
        console.log(`📋 Playlist created: "${name}" in room ${roomId}`);
        res.json({ playlist });
    } catch (err) {
        console.error('❌ Error creating playlist:', err);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// ─── Add a track to a playlist ───
router.post('/playlists/:playlistId/tracks', async (req, res) => {
    const playlistId = parseInt(req.params.playlistId);
    const { youtubeId, title, channel, thumbnail, duration, addedBy } = req.body;

    if (!youtubeId || !title || !addedBy) {
        return res.status(400).json({ error: 'Missing required track fields' });
    }

    try {
        const track = await prisma.playlistTrack.create({
            data: {
                playlistId,
                youtubeId,
                title,
                channel: channel || '',
                thumbnail: thumbnail || '',
                duration: duration || '',
                addedBy,
            },
        });
        console.log(`🎵 Track added to playlist ${playlistId}: "${title}"`);
        res.json({ track });
    } catch (err) {
        console.error('❌ Error adding track:', err);
        res.status(500).json({ error: 'Failed to add track' });
    }
});

// ─── Remove a track from a playlist ───
router.delete('/playlists/:playlistId/tracks/:trackId', async (req, res) => {
    const trackId = parseInt(req.params.trackId);

    try {
        await prisma.playlistTrack.delete({ where: { id: trackId } });
        console.log(`🗑️ Track ${trackId} removed`);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error removing track:', err);
        res.status(500).json({ error: 'Failed to remove track' });
    }
});

export default router;
