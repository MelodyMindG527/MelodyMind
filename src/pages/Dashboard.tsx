import React, { useState } from 'react';
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
} from '@mui/material';
import {
  CameraAlt,
  MusicNote,
  Psychology,
  TrendingUp,
  PlayArrow,
  Pause,
  QueueMusic,
  SmartToy,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import WebcamCapture from '../components/WebcamCapture';
import MoodDetectionModal from '../components/MoodDetectionModal';
import VoiceControl from '../components/VoiceControl';
import SmartPlaylistGenerator from '../components/SmartPlaylistGenerator';
import LocalMusicManager from '../components/LocalMusicManager';
import FloatingActionButton from '../components/FloatingActionButton';
import { useMusicStore } from '../store/musicStore';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showWebcam, setShowWebcam] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showSmartPlaylist, setShowSmartPlaylist] = useState(false);
  const [currentMood, setCurrentMood] = useState<any>(null);
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const { currentSong, isPlaying, togglePlay, playSong, generateMoodPlaylist } = useMusicStore();

  const handleMoodDetected = async (mood: any) => {
    setCurrentMood(mood);
    setPlaylistError(null);
    console.log('Mood detected:', mood);
    
    // Generate playlist based on detected mood
    try {
      setIsGeneratingPlaylist(true);
      const songs = await generateMoodPlaylist(mood.type, 5);
      if (songs.length > 0) {
        setCurrentMood((prev: any) => ({ ...prev, songs }));
        console.log('Generated songs for mood:', songs);
      } else {
        setPlaylistError('No songs found for this mood. Try scanning your local music library.');
      }
    } catch (error) {
      console.error('Failed to generate mood playlist:', error);
      setPlaylistError('Failed to generate playlist. Please try again.');
    } finally {
      setIsGeneratingPlaylist(false);
    }
  };

  // Track mood-to-song events for analytics
  const trackMoodSongEvent = async (mood: string, song: any) => {
    try {
      await fetch('http://localhost:8000/api/v1/analytics/events/mood-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
        },
        body: JSON.stringify({
          moodLabel: mood,
          song: song,
        }),
      });
    } catch (error) {
      console.error('Failed to track mood-song event:', error);
    }
  };

  const getMoodColor = (moodType: string) => {
    switch (moodType) {
      case 'happy':
        return '#4caf50';
      case 'sad':
        return '#f44336';
      case 'energetic':
        return '#ff9800';
      case 'calm':
        return '#2196f3';
      case 'anxious':
        return '#ff5722';
      case 'focused':
        return '#795548';
      default:
        return '#9e9e9e';
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            left: -50,
            right: -50,
            bottom: -50,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            zIndex: 0,
          }
        }}>
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              position: 'relative',
              zIndex: 1,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Welcome to MelodyMind
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              position: 'relative',
              zIndex: 1,
              fontWeight: 400,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            }}
          >
            Your AI-powered mood-based music companion
          </Typography>
          
          {/* Decorative elements */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mt: 3,
            position: 'relative',
            zIndex: 1,
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
              animation: 'pulse 2s ease-in-out infinite 0.5s',
            }} />
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              animation: 'pulse 2s ease-in-out infinite 1s',
            }} />
          </Box>
        </Box>
      </motion.div>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => setShowWebcam(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  animation: 'pulse 2s ease-in-out infinite',
                }}>
                  <CameraAlt sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Detect Your Mood
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Use your camera to analyze facial expressions and get personalized music recommendations
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, #34e89e 0%, #0f3443 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(52, 232, 158, 0.4)',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => setShowTextModal(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  animation: 'pulse 2s ease-in-out infinite 0.3s',
                }}>
                  <Psychology sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Describe Your Mood (Text)
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Type how you feel and get recommendations instantly
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(240, 147, 251, 0.4)',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => setShowVoice(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  animation: 'pulse 2s ease-in-out infinite 0.6s',
                }}>
                  <MusicNote sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Voice Control & Mood
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Speak commands (play, pause, next) or describe your mood
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(255, 154, 158, 0.4)',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => setShowSmartPlaylist(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  animation: 'pulse 2s ease-in-out infinite 0.9s',
                }}>
                  <SmartToy sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Smart Playlist Generator
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  AI-powered playlist creation based on your mood detection
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Current Mood & Music Section */}
      {currentMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎵 Your Mood-Based Music
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Chip
                  label={currentMood.type.charAt(0).toUpperCase() + currentMood.type.slice(1)}
                  sx={{
                    backgroundColor: getMoodColor(currentMood.type),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Typography variant="body1">
                  Intensity: {currentMood.intensity}/10
                </Typography>
                <Typography variant="body1">
                  Confidence: {Math.round(currentMood.confidence * 100)}%
                </Typography>
              </Box>

              {isGeneratingPlaylist && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Generating playlist...
                  </Typography>
                  <Box sx={{ width: 20, height: 20, border: '2px solid #f3f3f3', borderTop: '2px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </Box>
              )}

              {playlistError && (
                <Box sx={{ p: 2, backgroundColor: 'error.light', borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" color="error">
                    {playlistError}
                  </Typography>
                </Box>
              )}

              {currentMood.songs && currentMood.songs.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recommended Songs:
                  </Typography>
                  <Grid container spacing={2}>
                    {currentMood.songs.slice(0, 3).map((song: any, index: number) => (
                      <Grid item xs={12} sm={6} md={4} key={song.id}>
                        <Card sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          p: 2,
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          }
                        }}
                        onClick={() => {
                          playSong(song);
                          if (currentMood) {
                            trackMoodSongEvent(currentMood.type, song);
                          }
                        }}
                        >
                          <Avatar
                            src={song.cover}
                            alt={song.title}
                            sx={{ width: 48, height: 48, mr: 2 }}
                          />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight="bold" noWrap>
                              {song.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {song.artist}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(song.duration)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSong(song);
                              if (currentMood) {
                                trackMoodSongEvent(currentMood.type, song);
                              }
                            }}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Currently Playing */}
      {currentSong && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🎵 Now Playing
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={currentSong.cover}
                  alt={currentSong.title}
                  sx={{ width: 64, height: 64 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {currentSong.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {currentSong.artist}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentSong.album}
                  </Typography>
                </Box>
                <IconButton
                  size="large"
                  onClick={togglePlay}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Webcam Modal */}
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
      
      {/* Smart Playlist Generator */}
      <SmartPlaylistGenerator
        open={showSmartPlaylist}
        onClose={() => setShowSmartPlaylist(false)}
      />

      {/* Local Music Manager */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <LocalMusicManager />
      </motion.div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onCameraClick={() => setShowWebcam(true)}
        onTextClick={() => setShowTextModal(true)}
        onVoiceClick={() => setShowVoice(true)}
        onPlaylistClick={() => setShowSmartPlaylist(true)}
      />
    </Box>
  );
};

export default Dashboard; 