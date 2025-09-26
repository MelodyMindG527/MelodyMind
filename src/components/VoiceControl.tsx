import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Mic, MicOff, Close, CheckCircle, VolumeUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useMusicStore } from '../store/musicStore';

interface VoiceControlProps {
  open: boolean;
  onClose: () => void;
  onMoodDetected: (mood: any) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  open,
  onClose,
  onMoodDetected,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedMood, setDetectedMood] = useState<any>(null);
  const [error, setError] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const {
    currentSong,
    isPlaying,
    volume,
    queue,
    togglePlay,
    playNext,
    playPrevious,
    stopPlayback,
    setVolume,
    playSong,
    generateMoodPlaylist,
    addMoodToHistory,
  } = useMusicStore();

  const voiceCommands = [
    'play',
    'pause',
    'next',
    'previous',
    'search song',
    'volume up',
    'volume down',
    'stop',
  ];

  useEffect(() => {
    if (open) {
      setTranscript('');
      setDetectedMood(null);
      setError('');
      setCommandHistory([]);
    }
  }, [open]);

  const startListening = () => {
    setIsListening(true);
    setError('');
    
    // Simulate speech recognition
    setTimeout(() => {
      const sampleTranscripts = [
        "I'm feeling really happy today",
        "I'm a bit sad and need some uplifting music",
        "I'm feeling energetic and want to work out",
        "I'm anxious and need something calming",
        "Play some upbeat music",
        "I'm feeling focused and need concentration music",
      ];
      
      const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      setTranscript(randomTranscript);
      setIsListening(false);
      handleVoiceCommand(randomTranscript);
      analyzeVoiceMood(randomTranscript);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const analyzeVoiceMood = async (text: string) => {
    setIsAnalyzing(true);

    try {
      // Simulate AI mood analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simple keyword-based mood detection
      let detectedMoodType = 'neutral';
      let intensity = 5;

      if (text.toLowerCase().includes('happy') || text.toLowerCase().includes('upbeat')) {
        detectedMoodType = 'happy';
        intensity = 8;
      } else if (text.toLowerCase().includes('sad') || text.toLowerCase().includes('down')) {
        detectedMoodType = 'sad';
        intensity = 6;
      } else if (text.toLowerCase().includes('energetic') || text.toLowerCase().includes('workout')) {
        detectedMoodType = 'energetic';
        intensity = 9;
      } else if (text.toLowerCase().includes('anxious') || text.toLowerCase().includes('stressed')) {
        detectedMoodType = 'anxious';
        intensity = 7;
      } else if (text.toLowerCase().includes('focused') || text.toLowerCase().includes('concentration')) {
        detectedMoodType = 'focused';
        intensity = 8;
      } else if (text.toLowerCase().includes('calm') || text.toLowerCase().includes('relax')) {
        detectedMoodType = 'calm';
        intensity = 6;
      }

      const mood = {
        type: detectedMoodType,
        intensity,
        confidence: 0.75,
        source: 'voice',
        notes: `Voice analysis: "${text}"`,
      };

      setDetectedMood(mood);
      setCommandHistory(prev => [...prev, text]);
    } catch (err) {
      setError('Failed to analyze voice. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceCommand = (text: string) => {
    const t = text.toLowerCase();
    let executed = false;
    if (t.includes('pause') || t.includes('stop playing')) {
      if (isPlaying) togglePlay();
      executed = true;
    }
    if (t.includes('resume') || t.includes('continue')) {
      if (!isPlaying && currentSong) togglePlay();
      executed = true;
    }
    if (t.startsWith('play ') || t === 'play') {
      if (!isPlaying && currentSong) togglePlay();
      else if (!currentSong && queue.length > 0) playSong(queue[0]);
      executed = true;
    }
    if (t.includes('next')) {
      playNext();
      executed = true;
    }
    if (t.includes('previous') || t.includes('back')) {
      playPrevious();
      executed = true;
    }
    if (t.includes('stop')) {
      stopPlayback();
      executed = true;
    }
    if (t.includes('volume up')) {
      setVolume(Math.min(volume + 0.1, 1));
      executed = true;
    }
    if (t.includes('volume down')) {
      setVolume(Math.max(volume - 0.1, 0));
      executed = true;
    }
    if (executed) setCommandHistory((prev) => [...prev, `Command: ${text}`]);
  };

  const handleConfirm = async () => {
    if (detectedMood) {
      try {
        // Generate playlist based on detected mood
        const songs = await generateMoodPlaylist(detectedMood.type, 10);
        
        // Add mood to history
        addMoodToHistory({
          id: Date.now().toString(),
          type: detectedMood.type as any,
          intensity: detectedMood.intensity,
          timestamp: new Date(),
          source: 'voice',
          notes: detectedMood.notes,
        });

        onMoodDetected({
          ...detectedMood,
          songs: songs
        });
      } catch (err) {
        console.error('Playlist generation error:', err);
        // Fallback
        onMoodDetected(detectedMood);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setIsListening(false);
    setIsAnalyzing(false);
    setTranscript('');
    setDetectedMood(null);
    setError('');
    onClose();
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Voice Control & Mood Detection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Speak to control music or let us detect your mood from your voice tone
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Voice Recording Section */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <motion.div
            animate={{
              scale: isListening ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isListening ? Infinity : 0,
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={isListening ? <MicOff /> : <Mic />}
              onClick={isListening ? stopListening : startListening}
              disabled={isAnalyzing}
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: isListening ? '#f44336' : '#4caf50',
                '&:hover': {
                  backgroundColor: isListening ? '#d32f2f' : '#388e3c',
                },
              }}
            />
          </motion.div>
          
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isListening ? 'Listening...' : 'Tap to start listening'}
          </Typography>
          
          {isListening && (
            <Typography variant="body2" color="text.secondary">
              Speak now or describe how you're feeling
            </Typography>
          )}
        </Box>

        {/* Transcript Display */}
        {transcript && (
          <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What you said:
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                "{transcript}"
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {isAnalyzing && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Analyzing voice tone and content...
            </Typography>
          </Box>
        )}

        {detectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3, backgroundColor: `${getMoodColor(detectedMood.type)}10` }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detected Mood
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={detectedMood.type.charAt(0).toUpperCase() + detectedMood.type.slice(1)}
                    sx={{
                      backgroundColor: getMoodColor(detectedMood.type),
                      color: 'white',
                    }}
                  />
                  <Chip
                    label={`Intensity: ${detectedMood.intensity}/10`}
                    variant="outlined"
                  />
                  <Chip
                    label={`Confidence: ${Math.round(detectedMood.confidence * 100)}%`}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on voice tone and content analysis
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Voice Commands Help */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Voice Commands
            </Typography>
            <List dense>
              {voiceCommands.map((command, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <VolumeUp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={command} />
                </ListItem>
              ))}
            </List>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You can also describe your mood naturally, like "I'm feeling happy" or "I'm a bit sad today"
            </Typography>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined" startIcon={<Close />}>
          Cancel
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<CheckCircle />}
          disabled={!detectedMood || isAnalyzing}
          sx={{
            backgroundColor: detectedMood ? getMoodColor(detectedMood.type) : 'grey.400',
            '&:hover': {
              backgroundColor: detectedMood ? getMoodColor(detectedMood.type) : 'grey.400',
            },
          }}
        >
          Confirm & Get Music
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoiceControl; 