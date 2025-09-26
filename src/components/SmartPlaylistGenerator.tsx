import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  MusicNote,
  Psychology,
  CameraAlt,
  Mic,
  Edit,
  Delete,
  TrendingUp,
  SmartToy,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import WebcamCapture from './WebcamCapture';
import MoodDetectionModal from './MoodDetectionModal';
import VoiceControl from './VoiceControl';
import { useMusicStore } from '../store/musicStore';

interface SmartPlaylistGeneratorProps {
  open: boolean;
  onClose: () => void;
}

interface GeneratedPlaylist {
  id: string;
  name: string;
  description: string;
  mood: string;
  songs: any[];
  createdAt: Date;
  source: 'camera' | 'voice' | 'text';
}

const SmartPlaylistGenerator: React.FC<SmartPlaylistGeneratorProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [currentMood, setCurrentMood] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylists, setGeneratedPlaylists] = useState<GeneratedPlaylist[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState('');

  const { playSong, addToQueue } = useMusicStore();

  const sampleRecommendations = [
    {
      id: '1',
      title: 'Happy Vibes',
      artist: 'Sunshine Collective',
      album: 'Summer Days',
      duration: 180,
      cover: 'https://picsum.photos/300/300?random=1',
      genre: 'pop',
      mood: 'happy',
      confidence: 0.95,
    },
    {
      id: '2',
      title: 'Calm Waters',
      artist: 'Ocean Waves',
      album: 'Peaceful Moments',
      duration: 240,
      cover: 'https://picsum.photos/300/300?random=2',
      genre: 'ambient',
      mood: 'calm',
      confidence: 0.88,
    },
    {
      id: '3',
      title: 'Energetic Beat',
      artist: 'Power Pulse',
      album: 'Workout Mix',
      duration: 200,
      cover: 'https://picsum.photos/300/300?random=3',
      genre: 'electronic',
      mood: 'energetic',
      confidence: 0.92,
    },
  ];

  useEffect(() => {
    if (open) {
      setCurrentMood(null);
      setError('');
      setRecommendations([]);
    }
  }, [open]);

  const handleMoodDetected = async (mood: any) => {
    setCurrentMood(mood);
    setError('');
    await generateRecommendations(mood);
  };

  const generateRecommendations = async (mood: any) => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const filteredRecommendations = sampleRecommendations.filter(
        song => song.mood === mood.type || song.mood === mood.moodLabel
      );
      setRecommendations(filteredRecommendations);
    } catch (err) {
      setError('Failed to generate recommendations.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSmartPlaylist = async (source: 'camera' | 'voice' | 'text') => {
    if (!currentMood) {
      setError('Please detect your mood first');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newPlaylist: GeneratedPlaylist = {
        id: Date.now().toString(),
        name: `${currentMood.type || currentMood.moodLabel} Vibes`,
        description: `AI-generated playlist based on your ${source} mood detection`,
        mood: currentMood.type || currentMood.moodLabel,
        songs: recommendations.slice(0, 10),
        createdAt: new Date(),
        source,
      };
      setGeneratedPlaylists(prev => [newPlaylist, ...prev]);
      setTabValue(1);
    } catch (err) {
      setError('Failed to generate playlist.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getMoodColor = (moodType: string) => {
    switch (moodType) {
      case 'happy': return '#4caf50';
      case 'sad': return '#f44336';
      case 'energetic': return '#ff9800';
      case 'calm': return '#2196f3';
      case 'anxious': return '#ff5722';
      case 'focused': return '#795548';
      default: return '#9e9e9e';
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <SmartToy sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h5" fontWeight="bold">
              Smart Playlist Generator
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Delete />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab icon={<Psychology />} label="Mood Detection" />
            <Tab icon={<MusicNote />} label="Generated Playlists" />
            <Tab icon={<TrendingUp />} label="Recommendations" />
          </Tabs>
        </Box>

        {/* Mood Detection Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detect Your Mood to Generate Smart Playlists
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                  onClick={() => setShowWebcam(true)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <CameraAlt sx={{ fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Camera Mood Detection
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Use facial expressions to detect your mood
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #34e89e 0%, #0f3443 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                  onClick={() => setShowTextModal(true)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Psychology sx={{ fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Text Mood Analysis
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Describe your mood in text
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                  onClick={() => setShowVoice(true)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Mic sx={{ fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Voice Mood Detection
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Speak to detect mood and control music
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {currentMood && (
              <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Detected Mood
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip
                          label={currentMood.type || currentMood.moodLabel}
                          sx={{
                            backgroundColor: getMoodColor(currentMood.type || currentMood.moodLabel),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Confidence: {Math.round((currentMood.confidence || 0.5) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => generateSmartPlaylist(currentMood.source || 'text')}
                      disabled={isGenerating}
                      startIcon={isGenerating ? <CircularProgress size={20} /> : <Add />}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Playlist'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Generated Playlists Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Generated Playlists
            </Typography>

            {generatedPlaylists.length === 0 ? (
              <Box textAlign="center" py={4}>
                <MusicNote sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No playlists generated yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Detect your mood first to generate smart playlists
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {generatedPlaylists.map((playlist) => (
                  <Grid item xs={12} key={playlist.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {playlist.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {playlist.description}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Chip
                                label={playlist.mood}
                                size="small"
                                sx={{
                                  backgroundColor: getMoodColor(playlist.mood),
                                  color: 'white',
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {playlist.songs.length} songs
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlayArrow />}
                          >
                            Play
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Recommendations Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI-Powered Song Recommendations
            </Typography>

            {recommendations.length === 0 ? (
              <Box textAlign="center" py={4}>
                <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No recommendations yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Detect your mood to get personalized song recommendations
                </Typography>
              </Box>
            ) : (
              <List>
                {recommendations.map((song, index) => (
                  <ListItem
                    key={song.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={song.cover} alt={song.title}>
                        <MusicNote />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={song.title}
                      secondary={`${song.artist} • ${song.album} • ${formatTime(song.duration)}`}
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => playSong(song)}
                          color="primary"
                        >
                          <PlayArrow />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => addToQueue(song)}
                          color="secondary"
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Mood Detection Modals */}
      <WebcamCapture
        open={showWebcam}
        onClose={() => setShowWebcam(false)}
        onMoodDetected={handleMoodDetected}
      />

      <MoodDetectionModal
        open={showTextModal}
        onClose={() => setShowTextModal(false)}
        onMoodDetected={handleMoodDetected}
        source="text"
      />

      <VoiceControl
        open={showVoice}
        onClose={() => setShowVoice(false)}
        onMoodDetected={handleMoodDetected}
      />
    </Dialog>
  );
};

export default SmartPlaylistGenerator;
