import express from 'express';
import dayjs from 'dayjs';
import { requireAuth } from '../middleware/auth.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { GameSession } from '../models/GameSession.js';
import { MoodDetection } from '../models/MoodDetection.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';

const router = express.Router();

router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const [entries, games, moods] = await Promise.all([
      JournalEntry.countDocuments({ userId: req.user.id }),
      GameSession.countDocuments({ userId: req.user.id }),
      MoodDetection.countDocuments({ userId: req.user.id }),
    ]);

    const moodAvgAgg = await JournalEntry.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$moodLabel', count: { $sum: 1 }, avgIntensity: { $avg: '$intensity' } } },
    ]);

    const moodSongAgg = await AnalyticsEvent.aggregate([
      { $match: { userId: req.user.id, type: 'mood_song' } },
      { $group: { _id: '$moodLabel', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
    ]);

    res.json({
      totalJournalEntries: entries,
      totalGameSessions: games,
      totalMoodDetections: moods,
      moodDistribution: moodAvgAgg,
      moodSongCorrelation: moodSongAgg,
    });
  } catch (e) { next(e); }
});

router.get('/trends', requireAuth, async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days || 30), 365);
    const start = dayjs().subtract(days, 'day').startOf('day').toDate();
    const trend = await JournalEntry.aggregate([
      { $match: { userId: req.user.id, date: { $gte: start } } },
      {
        $group: {
          _id: { d: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
          avgIntensity: { $avg: '$intensity' },
          totalEntries: { $sum: 1 },
        },
      },
      { $sort: { '_id.d': 1 } },
    ]);
    res.json(trend.map((x) => ({ date: x._id.d, avg_intensity: x.avgIntensity, total_entries: x.totalEntries })));
  } catch (e) { next(e); }
});

export default router;

// Record a mood -> song event
router.post('/events/mood-song', requireAuth, async (req, res, next) => {
  try {
    const { moodLabel, song } = req.body || {};
    if (!moodLabel || !song) return res.status(400).json({ success: false, message: 'moodLabel and song required' });
    const created = await AnalyticsEvent.create({
      userId: req.user.id,
      type: 'mood_song',
      moodLabel,
      songId: song._id || song.id,
      songTitle: song.title,
      songArtist: song.artist,
      songGenres: song.genres || song.moodTags || [],
      metadata: { duration: song.duration },
    });
    res.status(201).json({ success: true, id: created.id });
  } catch (e) { next(e); }
});


