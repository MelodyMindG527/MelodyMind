import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  MusicNote,
  PlayArrow,
  Add,
  Refresh,
  FolderOpen,
} from '@mui/icons-material';
import { useMusicStore } from '../store/musicStore';

const LocalMusicManager: React.FC = () => {
  const {
    localSongs,
    isLoading,
    scanLocalMusic,
    loadLocalSongs,
    playSong,
    addToQueue,
  } = useMusicStore();

  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    // Load local songs on component mount
    loadLocalSongs();
  }, [loadLocalSongs]);

  const handleScanMusic = async () => {
    try {
      await scanLocalMusic();
      setScanResult({ success: true, message: 'Music scan completed successfully!' });
    } catch (error) {
      setScanResult({ success: false, message: 'Failed to scan music directory' });
    }
  };

  const handlePlaySong = (song: any) => {
    playSong(song);
  };

  const handleAddToQueue = (song: any) => {
    addToQueue(song);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MusicNote />
        Local Music Library
      </Typography>

      {/* Scan Music Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Music Directory Scanner
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Scan your local music directory to add songs to your library. Place your music files in the server's music folder.
          </Typography>
          
          {scanResult && (
            <Alert 
              severity={scanResult.success ? 'success' : 'error'} 
              sx={{ mb: 2 }}
              onClose={() => setScanResult(null)}
            >
              {scanResult.message}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
              onClick={handleScanMusic}
              disabled={isLoading}
            >
              {isLoading ? 'Scanning...' : 'Scan Music Directory'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FolderOpen />}
              onClick={loadLocalSongs}
              disabled={isLoading}
            >
              Refresh Library
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Local Songs List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Local Songs ({localSongs.length})
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : localSongs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MusicNote sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No local songs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scan your music directory to add songs to your library
              </Typography>
            </Box>
          ) : (
            <List>
              {localSongs.map((song, index) => (
                <React.Fragment key={song.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {song.title}
                          </Typography>
                          {song.is_local && (
                            <Chip 
                              label="Local" 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {song.artist} • {song.album}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {song.mood_tags?.map((tag: string) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                            {song.genres?.map((genre: string) => (
                              <Chip
                                key={genre}
                                label={genre}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDuration(song.duration)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handlePlaySong(song)}
                          color="primary"
                        >
                          <PlayArrow />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAddToQueue(song)}
                          color="secondary"
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < localSongs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LocalMusicManager;
