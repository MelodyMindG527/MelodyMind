import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import gridfsStream from 'gridfs-stream';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { Song } from '../models/Song.js';
import { scanMusicDirectory } from '../services/musicScanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// GridFS setup
let gfs;
mongoose.connection.once('open', () => {
  gfs = gridfsStream(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = new GridFsStorage({
  url: env.MONGODB_URI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'uploads',
      metadata: { uploadedBy: req.user?.id },
      contentType: file.mimetype,
    };
  },
});

const upload = multer({ storage });

// Upload a song
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { title, artist, album, duration, genres, moodTags } = req.body;
    const fileId = req.file?.id;
    if (!fileId) return res.status(400).json({ success: false, message: 'File required' });
    const song = await Song.create({
      title: title || req.file.originalname,
      artist,
      album,
      duration: duration ? Number(duration) : undefined,
      genres: genres ? [].concat(genres) : [],
      moodTags: moodTags ? [].concat(moodTags) : [],
      fileId,
    });
    res.status(201).json({ success: true, song });
  } catch (e) {
    next(e);
  }
});

// List songs
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const songs = await Song.find({}).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, items: songs });
  } catch (e) {
    next(e);
  }
});

// Stream song by id
// Note: streaming must be public for the browser <audio> element
router.get('/stream/:id', async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    
    if (song.isLocal && song.localPath) {
      // Serve local file
      if (!fs.existsSync(song.localPath)) {
        return res.status(404).json({ success: false, message: 'Local file not found' });
      }
      
      const stat = fs.statSync(song.localPath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(song.localPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': mime.lookup(song.localPath) || 'audio/mpeg',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': mime.lookup(song.localPath) || 'audio/mpeg',
        };
        res.writeHead(200, head);
        fs.createReadStream(song.localPath).pipe(res);
      }
    } else {
      // Serve GridFS file
      const file = await mongoose.connection.db
        .collection('uploads.files')
        .findOne({ _id: song.fileId });
      if (!file) return res.status(404).json({ success: false, message: 'File not found' });
      const readstream = gfs.createReadStream({ _id: song.fileId, root: 'uploads' });
      res.set('Content-Type', file.contentType || mime.lookup(song.title) || 'audio/mpeg');
      readstream.on('error', (err) => next(err));
      readstream.pipe(res);
    }
  } catch (e) {
    next(e);
  }
});

// Scan local music directory
router.post('/scan-local', requireAuth, async (req, res, next) => {
  try {
    const result = await scanMusicDirectory();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Get local songs
router.get('/local', requireAuth, async (req, res, next) => {
  try {
    const songs = await Song.find({ isLocal: true }).sort({ createdAt: -1 });
    res.json({ success: true, items: songs });
  } catch (e) {
    next(e);
  }
});

// Get song by mood
router.get('/by-mood/:mood', requireAuth, async (req, res, next) => {
  try {
    const { mood } = req.params;
    const { limit = 20 } = req.query;
    
    const songs = await Song.find({
      $or: [
        { moodTags: { $in: [mood] } },
        { genres: { $in: [mood] } }
      ]
    })
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
    
    res.json({ success: true, items: songs });
  } catch (e) {
    next(e);
  }
});

export default router;


