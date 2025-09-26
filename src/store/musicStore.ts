import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch, apiUrl } from '../utils/api';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  cover: string;
  genre: string;
  audio_url?: string;
  cover_url?: string;
  is_local?: boolean;
  mood_tags?: string[];
  genres?: string[];
}

export interface Mood {
  id: string;
  type: 'happy' | 'sad' | 'energetic' | 'calm' | 'anxious' | 'excited' | 'melancholic' | 'focused';
  intensity: number; // 1-10
  timestamp: Date;
  source: 'camera' | 'text' | 'voice' | 'journal';
  notes?: string;
  confidence?: number; // 0-1 confidence score for mood detection
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  mood: string;
  created: Date;
}

interface MusicState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  queue: Song[];
  currentMood: Mood | null;
  moodHistory: Mood[];
  playlists: Playlist[];
  isLoading: boolean;
  currentTime: number;
  duration: number;
  audioElement: HTMLAudioElement | null;
  localSongs: Song[];
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  setCurrentMood: (mood: Mood) => void;
  addMoodToHistory: (mood: Mood) => void;
  createPlaylist: (playlist: Omit<Playlist, 'id' | 'created'>) => void;
  setLoading: (loading: boolean) => void;
  
  // Music controls
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  playSong: (song: Song) => void;
  stopPlayback: () => void;
  
  // Local music management
  scanLocalMusic: () => Promise<void>;
  loadLocalSongs: () => Promise<void>;
  generateMoodPlaylist: (mood: string, maxItems?: number) => Promise<Song[]>;
}

const dummySongs: Song[] = [
  {
    id: '1',
    title: 'Happy Days',
    artist: 'Sunshine Band',
    album: 'Summer Vibes',
    duration: 180,
    url: 'https://example.com/song1.mp3',
    cover: 'https://picsum.photos/300/300?random=1',
    genre: 'pop',
  },
  {
    id: '2',
    title: 'Calm Waters',
    artist: 'Ocean Waves',
    album: 'Peaceful Moments',
    duration: 240,
    url: 'https://example.com/song2.mp3',
    cover: 'https://picsum.photos/300/300?random=2',
    genre: 'ambient',
  },
  {
    id: '3',
    title: 'Energetic Beat',
    artist: 'Power Pulse',
    album: 'Workout Mix',
    duration: 200,
    url: 'https://example.com/song3.mp3',
    cover: 'https://picsum.photos/300/300?random=3',
    genre: 'electronic',
  },
];

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      volume: 0.7,
      queue: [],
      currentMood: null,
      moodHistory: [],
      playlists: [],
      isLoading: false,
      currentTime: 0,
      duration: 0,
      audioElement: null,
      localSongs: [],
      
      setCurrentSong: (song) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.pause();
        }
        
        if (song) {
          const newAudio = new Audio(song.audio_url || song.url);
          newAudio.volume = get().volume;
          
          newAudio.addEventListener('loadedmetadata', () => {
            set({ duration: newAudio.duration });
          });
          
          newAudio.addEventListener('timeupdate', () => {
            set({ currentTime: newAudio.currentTime });
          });
          
          newAudio.addEventListener('ended', () => {
            get().playNext();
          });
          
          set({ 
            currentSong: song, 
            audioElement: newAudio,
            isPlaying: false,
            currentTime: 0,
            duration: 0
          });
        } else {
          set({ 
            currentSong: null, 
            audioElement: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0
          });
        }
      },
      
      togglePlay: () => {
        const { audioElement, isPlaying } = get();
        if (audioElement) {
          if (isPlaying) {
            audioElement.pause();
            set({ isPlaying: false });
          } else {
            audioElement.play();
            set({ isPlaying: true });
          }
        }
      },
      
      setVolume: (volume) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.volume = volume;
        }
        set({ volume });
      },
      
      addToQueue: (song) => set((state) => ({ 
        queue: [...state.queue, song] 
      })),
      
      removeFromQueue: (songId) => set((state) => ({
        queue: state.queue.filter(song => song.id !== songId)
      })),
      
      setCurrentMood: (mood) => set({ currentMood: mood }),
      
      addMoodToHistory: (mood) => set((state) => ({
        moodHistory: [mood, ...state.moodHistory]
      })),
      
      createPlaylist: (playlist) => set((state) => ({
        playlists: [
          {
            ...playlist,
            id: Date.now().toString(),
            created: new Date(),
          },
          ...state.playlists,
        ]
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      playSong: (song) => {
        get().setCurrentSong(song);
        setTimeout(() => {
          get().togglePlay();
        }, 100);
      },
      
      stopPlayback: () => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        set({ isPlaying: false, currentTime: 0 });
      },
      
      playNext: () => {
        const { queue, currentSong } = get();
        const currentIndex = queue.findIndex(song => song.id === currentSong?.id);
        const nextSong = queue[currentIndex + 1] || queue[0];
        if (nextSong) {
          get().playSong(nextSong);
        }
      },
      
      playPrevious: () => {
        const { queue, currentSong } = get();
        const currentIndex = queue.findIndex(song => song.id === currentSong?.id);
        const prevSong = queue[currentIndex - 1] || queue[queue.length - 1];
        if (prevSong) {
          get().playSong(prevSong);
        }
      },
      
      seekTo: (time) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.currentTime = time;
          set({ currentTime: time });
        }
      },
      
      // Local music management
      scanLocalMusic: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch('http://localhost:8000/api/v1/songs/scan-local', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Local music scan result:', result);
            // Reload local songs after scanning
            get().loadLocalSongs();
          } else {
            console.error('Failed to scan local music:', response.statusText);
          }
        } catch (error) {
          console.error('Error scanning local music:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadLocalSongs: async () => {
        try {
          const response = await apiFetch('/api/v1/songs/local');
          
          if (response.ok) {
            const result = await response.json();
            const songs = result.items.map((song: any) => ({
              id: song._id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              duration: song.duration,
              url: `${apiUrl}/api/v1/songs/stream/${song._id}`,
              cover: song.coverUrl || `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`,
              genre: song.genres?.[0] || 'unknown',
              audio_url: `${apiUrl}/api/v1/songs/stream/${song._id}`,
              cover_url: song.coverUrl,
              is_local: song.isLocal,
              mood_tags: song.moodTags,
              genres: song.genres,
            }));
            set({ localSongs: songs });
          } else {
            console.error('Failed to load local songs:', response.statusText);
          }
        } catch (error) {
          console.error('Error loading local songs:', error);
        }
      },
      
      generateMoodPlaylist: async (mood: string, maxItems = 10) => {
        try {
          set({ isLoading: true });
          const response = await fetch('http://localhost:8000/api/v1/playlists/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
            },
            body: JSON.stringify({
              mood_label: mood,
              max_items: maxItems,
              playlist_name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood Playlist`,
              prefer_local: true,
            }),
          });
          
          if (response.ok) {
            const playlist = await response.json();
            const songs = playlist.items.map((item: any) => ({
              id: item.song_id,
              title: item.song_title,
              artist: item.artist,
              album: item.album,
              duration: item.duration,
              url: `http://localhost:8000${item.audio_url}`,
              cover: item.cover_url || `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`,
              genre: item.genres?.[0] || 'unknown',
              audio_url: `http://localhost:8000${item.audio_url}`,
              cover_url: item.cover_url,
              is_local: item.is_local,
              mood_tags: item.mood_tags,
              genres: item.genres,
            }));
            
            // Add songs to queue and play first one
            if (songs.length > 0) {
              set({ queue: songs });
              get().playSong(songs[0]);
            }
            
            return songs;
          } else {
            console.error('Failed to generate mood playlist:', response.statusText);
            return [];
          }
        } catch (error) {
          console.error('Error generating mood playlist:', error);
          return [];
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'music-storage',
      partialize: (state) => ({
        volume: state.volume,
        moodHistory: state.moodHistory,
        playlists: state.playlists,
        currentMood: state.currentMood,
      }),
    }
  )
); 