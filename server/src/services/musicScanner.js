import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Song } from '../models/Song.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported audio file extensions
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac'];

// Mood mapping based on filename patterns and genres
const MOOD_MAPPING = {
  // Happy/Upbeat patterns
  happy: ['happy', 'upbeat', 'cheerful', 'joy', 'sunshine', 'summer', 'party', 'dance'],
  energetic: ['energetic', 'energy', 'workout', 'gym', 'running', 'fast', 'pump', 'power'],
  excited: ['excited', 'excitement', 'thrilled', 'pumped', 'hyped', 'wild'],
  
  // Calm/Relaxing patterns
  calm: ['calm', 'peaceful', 'serene', 'tranquil', 'meditation', 'zen', 'chill', 'relax'],
  focused: ['focused', 'concentration', 'study', 'work', 'ambient', 'instrumental', 'classical'],
  
  // Sad/Melancholic patterns
  sad: ['sad', 'melancholy', 'blue', 'depressed', 'lonely', 'tears', 'cry', 'heartbreak'],
  melancholic: ['melancholic', 'nostalgic', 'bittersweet', 'wistful', 'reflective'],
  
  // Anxious patterns
  anxious: ['anxious', 'anxiety', 'nervous', 'worried', 'tense', 'stress', 'overwhelmed']
};

// Genre mapping
const GENRE_MAPPING = {
  pop: ['pop', 'mainstream', 'radio'],
  rock: ['rock', 'alternative', 'indie'],
  electronic: ['electronic', 'edm', 'techno', 'house', 'trance', 'ambient'],
  classical: ['classical', 'orchestral', 'piano', 'violin', 'symphony'],
  jazz: ['jazz', 'blues', 'soul', 'funk'],
  hiphop: ['hiphop', 'rap', 'urban'],
  country: ['country', 'folk', 'acoustic'],
  ambient: ['ambient', 'atmospheric', 'soundscape']
};

/**
 * Extract mood tags from filename and metadata
 */
function extractMoodTags(filename, title = '') {
  const text = (filename + ' ' + title).toLowerCase();
  const moodTags = [];
  
  for (const [mood, patterns] of Object.entries(MOOD_MAPPING)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      moodTags.push(mood);
    }
  }
  
  return moodTags.length > 0 ? moodTags : ['neutral'];
}

/**
 * Extract genre from filename and metadata
 */
function extractGenres(filename, title = '') {
  const text = (filename + ' ' + title).toLowerCase();
  const genres = [];
  
  for (const [genre, patterns] of Object.entries(GENRE_MAPPING)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      genres.push(genre);
    }
  }
  
  return genres.length > 0 ? genres : ['unknown'];
}

/**
 * Parse filename to extract metadata
 */
function parseFilename(filename) {
  // Remove extension
  const nameWithoutExt = path.parse(filename).name;
  
  // Common patterns: "Artist - Song Title", "Artist_Song Title", "Song Title - Artist"
  const patterns = [
    /^(.+?)\s*-\s*(.+)$/,  // "Artist - Song"
    /^(.+?)_(.+)$/,        // "Artist_Song"
    /^(.+?)\s*–\s*(.+)$/,  // "Artist – Song" (en dash)
  ];
  
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      const [, part1, part2] = match;
      // Assume the longer part is the song title
      if (part1.length > part2.length) {
        return { artist: part1.trim(), title: part2.trim() };
      } else {
        return { artist: part2.trim(), title: part1.trim() };
      }
    }
  }
  
  // If no pattern matches, use the whole filename as title
  return { artist: 'Unknown Artist', title: nameWithoutExt };
}

/**
 * Get file duration (simplified - in real implementation, you'd use a library like node-ffmpeg)
 */
function getFileDuration(filePath) {
  // This is a placeholder - in a real implementation, you'd use a library like node-ffmpeg
  // to get the actual duration of the audio file
  return Math.floor(Math.random() * 300) + 60; // Random duration between 1-6 minutes
}

/**
 * Scan the music directory for audio files
 */
export async function scanMusicDirectory() {
  const musicDir = path.join(__dirname, '../../music');
  
  try {
    // Check if music directory exists
    if (!fs.existsSync(musicDir)) {
      console.log('Music directory does not exist, creating...');
      fs.mkdirSync(musicDir, { recursive: true });
      return { success: true, message: 'Music directory created', songs: [] };
    }
    
    const files = fs.readdirSync(musicDir);
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_EXTENSIONS.includes(ext);
    });
    
    if (audioFiles.length === 0) {
      return { success: true, message: 'No audio files found in music directory', songs: [] };
    }
    
    console.log(`Found ${audioFiles.length} audio files in music directory`);
    
    const songs = [];
    
    for (const file of audioFiles) {
      try {
        const filePath = path.join(musicDir, file);
        const stats = fs.statSync(filePath);
        const { artist, title } = parseFilename(file);
        const moodTags = extractMoodTags(file, title);
        const genres = extractGenres(file, title);
        const duration = getFileDuration(filePath);
        
        // Check if song already exists in database
        const existingSong = await Song.findOne({ 
          title: { $regex: new RegExp(title, 'i') },
          artist: { $regex: new RegExp(artist, 'i') }
        });
        
        if (existingSong) {
          // Ensure existing entries are marked as local and updated
          existingSong.isLocal = true;
          existingSong.localPath = existingSong.localPath || filePath;
          existingSong.fileSize = stats.size;
          existingSong.lastModified = stats.mtime;
          if (!existingSong.genres?.length) existingSong.genres = genres;
          if (!existingSong.moodTags?.length) existingSong.moodTags = moodTags;
          await existingSong.save();
          console.log(`Updated existing song: ${title} by ${artist}`);
          songs.push(existingSong);
          continue;
        }
        
        // Create song record
        const songData = {
          title,
          artist,
          album: 'Local Collection',
          duration,
          genres,
          moodTags,
          fileId: null, // Local files don't use GridFS
          coverUrl: `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`,
          localPath: filePath,
          fileSize: stats.size,
          lastModified: stats.mtime,
          isLocal: true,
        };
        
        const song = await Song.create(songData);
        songs.push(song);
        
        console.log(`Added song: ${title} by ${artist} (${moodTags.join(', ')})`);
        
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    }
    
    return {
      success: true,
      message: `Successfully processed ${songs.length} songs`,
      songs: songs.map(song => ({
        id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        genres: song.genres,
        moodTags: song.moodTags,
        coverUrl: song.coverUrl,
        localPath: song.localPath
      }))
    };
    
  } catch (error) {
    console.error('Error scanning music directory:', error);
    return { success: false, message: error.message, songs: [] };
  }
}

/**
 * Get songs from local directory (for serving files)
 */
export function getLocalSongPath(songId) {
  // This would typically query the database to get the localPath
  // For now, we'll implement this in the songs route
  return null;
}
