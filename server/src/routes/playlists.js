import express from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/auth.js';
import { Playlist } from '../models/Playlist.js';
import { Song } from '../models/Song.js';

const router = express.Router();

// Create
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, description, moodLabel, isPublic } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'name required' });
    const playlist = await Playlist.create({ userId: req.user.id, name, description, moodLabel, isPublic: !!isPublic, items: [] });
    res.status(201).json(playlist);
  } catch (e) { next(e); }
});

// Get by id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('items.song');
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    res.json(playlist);
  } catch (e) { next(e); }
});

// Update
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { name, description, moodLabel, isPublic } = req.body || {};
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (moodLabel !== undefined) playlist.moodLabel = moodLabel;
    if (isPublic !== undefined) playlist.isPublic = !!isPublic;
    await playlist.save();
    res.json(playlist);
  } catch (e) { next(e); }
});

// Delete
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    await playlist.deleteOne();
    res.json({ success: true });
  } catch (e) { next(e); }
});

// List user playlists
router.get('/user/me/list', requireAuth, async (req, res, next) => {
  try {
    const items = await Playlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

// Add item
router.post('/:id/items', requireAuth, async (req, res, next) => {
  try {
    const { songId } = req.body || {};
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    playlist.items.push({ song: song._id, order: playlist.items.length });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (e) { next(e); }
});

// Get items
router.get('/:id/items', requireAuth, async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('items.song');
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    res.json(playlist.items);
  } catch (e) { next(e); }
});

// Compatibility: generate playlist from mood (to match existing frontend expectations)
router.post('/generate', requireAuth, async (req, res, next) => {
  try {
    const moodLabel = (req.body?.mood_label || req.query.mood_label || 'neutral').toString();
    const name = (req.body?.playlist_name || req.query.playlist_name || 'Generated Playlist').toString();
    const maxItems = Math.min(Number(req.body?.max_items || req.query.max_items || 20), 100);
    const preferLocal = req.body?.prefer_local !== false; // Default to true

    // Build query to prioritize local songs and mood matching
    let filter = {};
    
    if (preferLocal) {
      // First try to find local songs with exact mood match
      filter = {
        isLocal: true,
        $or: [
          { moodTags: { $in: [moodLabel] } },
          { genres: { $in: [moodLabel] } }
        ]
      };
    } else {
      // Find any songs with mood match
      filter = {
        $or: [
          { moodTags: { $in: [moodLabel] } },
          { genres: { $in: [moodLabel] } }
        ]
      };
    }

    let songs = await Song.find(filter).limit(maxItems);

    // If not enough songs found and we prefer local, fallback to any local songs
    if (songs.length < maxItems && preferLocal) {
      const additionalSongs = await Song.find({
        isLocal: true,
        _id: { $nin: songs.map(s => s._id) }
      }).limit(maxItems - songs.length);
      songs = [...songs, ...additionalSongs];
    }

    // If still not enough songs, get any available songs
    if (songs.length < maxItems) {
      const additionalSongs = await Song.find({
        _id: { $nin: songs.map(s => s._id) }
      }).limit(maxItems - songs.length);
      songs = [...songs, ...additionalSongs];
    }

    // Shuffle songs for variety
    songs = songs.sort(() => Math.random() - 0.5);

    const playlist = await Playlist.create({
      userId: req.user.id,
      name: `${name} - ${moodLabel.charAt(0).toUpperCase() + moodLabel.slice(1)}`,
      description: `Auto-generated playlist for ${moodLabel} mood`,
      moodLabel,
      items: songs.map((s, idx) => ({ song: s._id, order: idx })),
    });

    const populated = await Playlist.findById(playlist._id).populate('items.song');
    
    // Format response to match frontend expectations
    const formattedPlaylist = {
      ...populated.toObject(),
      items: populated.items.map(item => ({
        song_id: item.song._id,
        song_title: item.song.title,
        artist: item.song.artist,
        album: item.song.album,
        duration: item.song.duration,
        audio_url: item.song.isLocal 
          ? `/api/v1/songs/stream/${item.song._id}`
          : `/api/v1/songs/stream/${item.song._id}`,
        cover_url: item.song.coverUrl,
        mood_tags: item.song.moodTags,
        genres: item.song.genres,
        is_local: item.song.isLocal
      }))
    };

    res.status(201).json(formattedPlaylist);
  } catch (e) { next(e); }
});

export default router;


