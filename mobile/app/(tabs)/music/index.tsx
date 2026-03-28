import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { useMusic } from '../../../hooks/useMusic';
import { Search, Play, ListPlus, Disc, X, Trash2 } from 'lucide-react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

type Tab = 'search' | 'queue' | 'playlists';

interface Track {
    youtubeId: string;
    title: string;
    channel: string;
    thumbnail: string;
    duration?: string;
}

interface PlaylistTrack extends Track {
    id: number;
    addedBy: string;
}

interface Playlist {
    id: number;
    name: string;
    createdBy: string;
    tracks: PlaylistTrack[];
}

export default function MusicScreen() {
    const { session } = useAuth();
    const { playTrack, addToQueue, queue, removeFromQueue } = useMusic();
    const roomId = session?.room.id;
    const userRole = session?.user.role || 'unknown';

    const [activeTab, setActiveTab] = useState<Tab>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

    // Fetch playlists
    const fetchPlaylists = useCallback(async () => {
        if (!roomId) return;
        try {
            const res = await fetch(`${API_URL}/api/music/playlists?roomId=${roomId}`);
            const data = await res.json();
            if (data.playlists) setPlaylists(data.playlists);
        } catch (err) {
            console.error('🎵 Music: Failed to fetch playlists:', err);
        }
    }, [roomId]);

    useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

    // Search
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`${API_URL}/api/music/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch (err) {
            console.error('🎵 Music: Search failed:', err);
        }
        setIsSearching(false);
    };

    // Create playlist
    const createPlaylist = async () => {
        if (!newPlaylistName.trim() || !roomId) return;
        try {
            await fetch(`${API_URL}/api/music/playlists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, name: newPlaylistName, createdBy: userRole }),
            });
            setNewPlaylistName('');
            setShowCreatePlaylist(false);
            fetchPlaylists();
        } catch (err) { console.error('🎵 Music: Failed to create playlist:', err); }
    };

    // Add track to playlist
    const addTrackToPlaylist = async (playlistId: number, track: Track) => {
        try {
            await fetch(`${API_URL}/api/music/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    youtubeId: track.youtubeId, title: track.title,
                    channel: track.channel, thumbnail: track.thumbnail, addedBy: userRole,
                }),
            });
            fetchPlaylists();
        } catch (err) { console.error('🎵 Music: Failed to add track:', err); }
    };

    // Remove track from playlist
    const removeTrack = async (playlistId: number, trackId: number) => {
        try {
            await fetch(`${API_URL}/api/music/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' });
            fetchPlaylists();
        } catch (err) { console.error('🎵 Music: Failed to remove track:', err); }
    };

    // Show playlist picker
    const showPlaylistPicker = (track: Track) => {
        if (playlists.length === 0) {
            Alert.alert('No Playlists', 'Create a playlist first!');
            return;
        }
        Alert.alert(
            'Add to Playlist',
            `"${track.title.substring(0, 40)}..."`,
            [
                ...playlists.map(pl => ({
                    text: `💿 ${pl.name}`,
                    onPress: () => addTrackToPlaylist(pl.id, track),
                })),
                { text: 'Cancel', style: 'cancel' as const },
            ]
        );
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: 'search', label: '🔍 Search' },
        { key: 'queue', label: `📋 Queue (${queue.length})` },
        { key: 'playlists', label: '💿 Playlists' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            {/* Tab Switcher */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 8, paddingHorizontal: 16 }}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        style={{
                            paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
                            backgroundColor: activeTab === tab.key ? '#E8788A' : 'rgba(255,255,255,0.05)',
                        }}
                    >
                        <Text style={{ color: activeTab === tab.key ? 'white' : '#8A8FA8', fontWeight: '600', fontSize: 13 }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* SEARCH TAB */}
            {activeTab === 'search' && (
                <View style={{ flex: 1, paddingHorizontal: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search for any song..."
                            placeholderTextColor="#8A8FA8"
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            style={{ flex: 1, backgroundColor: '#1C2038', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12, color: 'white', fontSize: 14 }}
                        />
                        <TouchableOpacity onPress={handleSearch} disabled={isSearching}
                            style={{ backgroundColor: '#E8788A', paddingHorizontal: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                            {isSearching ? <ActivityIndicator color="white" size="small" /> : <Search size={18} color="white" />}
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, i) => item.youtubeId + i}
                        renderItem={({ item }) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' }}>
                                <Image source={{ uri: item.thumbnail }} style={{ width: 56, height: 42, borderRadius: 6, marginRight: 12 }} />
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }} numberOfLines={2}>
                                        {item.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                    </Text>
                                    <Text style={{ color: '#8A8FA8', fontSize: 11, marginTop: 2 }}>{item.channel}</Text>
                                </View>
                                <TouchableOpacity onPress={() => playTrack(item)} style={{ padding: 8 }}>
                                    <Play size={18} color="#F2A7C3" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => addToQueue(item)} style={{ padding: 8 }}>
                                    <ListPlus size={18} color="#8A8FA8" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => showPlaylistPicker(item)} style={{ padding: 8 }}>
                                    <Disc size={18} color="#8A8FA8" />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', paddingTop: 60 }}>
                                <Text style={{ fontSize: 48, marginBottom: 16 }}>🎵</Text>
                                <Text style={{ color: '#8A8FA8', fontSize: 16 }}>Search for your favorite songs</Text>
                                <Text style={{ color: 'rgba(138,143,168,0.5)', fontSize: 13, marginTop: 4 }}>Results will appear here</Text>
                            </View>
                        }
                        ListFooterComponent={<View style={{ height: 100 }} />}
                    />
                </View>
            )}

            {/* QUEUE TAB */}
            {activeTab === 'queue' && (
                <View style={{ flex: 1, paddingHorizontal: 16 }}>
                    {queue.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingTop: 60 }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎶</Text>
                            <Text style={{ color: '#8A8FA8', fontSize: 16 }}>Queue is empty</Text>
                            <Text style={{ color: 'rgba(138,143,168,0.5)', fontSize: 13, marginTop: 4 }}>Search and add songs!</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={queue}
                            keyExtractor={(item, i) => item.youtubeId + i}
                            renderItem={({ item, index }) => (
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' }}>
                                    <Text style={{ color: '#8A8FA8', fontSize: 12, width: 24 }}>{index + 1}</Text>
                                    <Image source={{ uri: item.thumbnail }} style={{ width: 48, height: 36, borderRadius: 4, marginRight: 12 }} />
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={{ color: 'white', fontSize: 13 }} numberOfLines={1}>
                                            {item.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeFromQueue(index)} style={{ padding: 8 }}>
                                        <X size={18} color="#E8788A" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListFooterComponent={<View style={{ height: 100 }} />}
                        />
                    )}
                </View>
            )}

            {/* PLAYLISTS TAB */}
            {activeTab === 'playlists' && (
                <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                    {showCreatePlaylist ? (
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                            <TextInput
                                value={newPlaylistName}
                                onChangeText={setNewPlaylistName}
                                placeholder="Playlist name..."
                                placeholderTextColor="#8A8FA8"
                                onSubmitEditing={createPlaylist}
                                returnKeyType="done"
                                style={{ flex: 1, backgroundColor: '#1C2038', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, color: 'white', fontSize: 14 }}
                            />
                            <TouchableOpacity onPress={createPlaylist}
                                style={{ backgroundColor: '#E8788A', paddingHorizontal: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setShowCreatePlaylist(true)}
                            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center' }}>
                            <Text style={{ color: '#8A8FA8', fontWeight: '600' }}>+ New Playlist</Text>
                        </TouchableOpacity>
                    )}

                    {playlists.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingTop: 40 }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>💿</Text>
                            <Text style={{ color: '#8A8FA8', fontSize: 16 }}>No playlists yet</Text>
                            <Text style={{ color: 'rgba(138,143,168,0.5)', fontSize: 13, marginTop: 4 }}>Create one to save your favorites!</Text>
                        </View>
                    ) : (
                        playlists.map(pl => (
                            <View key={pl.id} style={{ marginBottom: 24 }}>
                                <Text style={{ color: '#F2A7C3', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                                    {pl.name} <Text style={{ color: '#8A8FA8', fontSize: 12, fontWeight: 'normal' }}>({pl.tracks.length} songs)</Text>
                                </Text>
                                {pl.tracks.map(track => (
                                    <View key={track.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' }}>
                                        <Image source={{ uri: track.thumbnail }} style={{ width: 42, height: 32, borderRadius: 4, marginRight: 10 }} />
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={{ color: 'white', fontSize: 12 }} numberOfLines={1}>
                                                {track.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => playTrack({ youtubeId: track.youtubeId, title: track.title, channel: track.channel, thumbnail: track.thumbnail })} style={{ padding: 6 }}>
                                            <Play size={16} color="#F2A7C3" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeTrack(pl.id, track.id)} style={{ padding: 6 }}>
                                            <Trash2 size={16} color="#E8788A" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ))
                    )}
                    <View style={{ height: 120 }} />
                </ScrollView>
            )}
        </View>
    );
}
