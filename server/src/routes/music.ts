import { Router } from 'express';
import prisma from '../db/database';
import youtubedl from 'youtube-dl-exec';

const router = Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// ─── Get audio stream URL via yt-dlp (bypasses bot detection) ───
router.get('/stream/:youtubeId', async (req, res) => {
    const { youtubeId } = req.params;
    if (!youtubeId) {
        return res.status(400).json({ error: 'Missing youtubeId' });
    }

    console.log(`🎵 Getting audio stream via yt-dlp for: ${youtubeId}`);
    
    try {
        const url = `https://www.youtube.com/watch?v=${youtubeId}`;
        
        // Use youtube-dl-exec to get video info (downloads raw yt-dlp binary under the hood)
        const output: any = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });

        // Find the best audio-only format
        const audioFormats = output.formats.filter(
            (f: any) => f.resolution === 'audio only' || (f.acodec !== 'none' && f.vcodec === 'none')
        ).sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));

        if (audioFormats.length > 0) {
            const best = audioFormats[0];
            console.log(`✅ Success via yt-dlp! Format: ${best.ext}, ABR: ${best.abr}kbps`);
            
            return res.json({
                audioUrl: best.url,
                mimeType: `audio/${best.ext}`,
                duration: output.duration || 0,
                title: output.title || '',
            });
        } else {
            console.error(`❌ Found video info, but no audio-only formats for ${youtubeId}`);
            return res.status(404).json({ error: 'No audio stream found' });
        }
    } catch (err: any) {
        console.error(`❌ yt-dlp failed for ${youtubeId}:`, err.message);
        res.status(502).json({ error: 'Failed to extract stream using yt-dlp' });
    }
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
