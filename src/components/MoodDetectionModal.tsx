import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useMusicStore } from '../store/musicStore';
import { apiFetch } from '../utils/api';

interface MoodDetectionModalProps {
  open: boolean;
  onClose: () => void;
  onMoodDetected: (mood: any) => void;
  source: 'text' | 'camera' | 'voice';
}

const moodOptions = [
  { value: 'happy', label: 'Happy', color: '#4caf50' },
  { value: 'sad', label: 'Sad', color: '#f44336' },
  { value: 'energetic', label: 'Energetic', color: '#ff9800' },
  { value: 'calm', label: 'Calm', color: '#2196f3' },
  { value: 'anxious', label: 'Anxious', color: '#ff5722' },
  { value: 'excited', label: 'Excited', color: '#9c27b0' },
  { value: 'melancholic', label: 'Melancholic', color: '#607d8b' },
  { value: 'focused', label: 'Focused', color: '#795548' },
];

const MoodDetectionModal: React.FC<MoodDetectionModalProps> = ({
  open,
  onClose,
  onMoodDetected,
  source,
}) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const { generateMoodPlaylist, addMoodToHistory, setCurrentMood } = useMusicStore();

  const handleSubmit = async () => {
    if (!selectedMood) return;

    try {
      // Generate playlist based on selected mood
      const songs = await generateMoodPlaylist(selectedMood, 10);
      
      // Add mood to history
      addMoodToHistory({
        id: Date.now().toString(),
        type: selectedMood as any,
        intensity,
        timestamp: new Date(),
        source,
        notes,
      });

      setCurrentMood({
        id: Date.now().toString(),
        type: selectedMood as any,
        intensity,
        timestamp: new Date(),
        source,
        notes,
      });

      if (songs && songs[0]) {
        try {
          await apiFetch('/api/v1/analytics/events/mood-song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moodLabel: selectedMood, song: songs[0] }),
          });
        } catch (e) {
          // ignore analytics error
        }
      }

      onMoodDetected({
        type: selectedMood,
        intensity,
        source,
        notes,
        songs: songs
      });
    } catch (err) {
      console.error('Playlist generation error:', err);
      // Fallback
      onMoodDetected({
        type: selectedMood,
        intensity,
        source,
        notes,
      });
    }

    // Reset form
    setSelectedMood('');
    setIntensity(5);
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setSelectedMood('');
    setIntensity(5);
    setNotes('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          How are you feeling?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Describe your current mood to get personalized music recommendations
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select your mood
          </Typography>
          <Grid container spacing={1}>
            {moodOptions.map((mood) => (
              <Grid item key={mood.value}>
                <Chip
                  label={mood.label}
                  onClick={() => setSelectedMood(mood.value)}
                  sx={{
                    backgroundColor: selectedMood === mood.value ? mood.color : 'grey.100',
                    color: selectedMood === mood.value ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: selectedMood === mood.value ? mood.color : 'grey.200',
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mood Intensity: {intensity}/10
          </Typography>
          <Slider
            value={intensity}
            onChange={(_, value) => setIntensity(value as number)}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-mark': {
                backgroundColor: 'grey.400',
              },
              '& .MuiSlider-markLabel': {
                fontSize: '0.75rem',
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Additional notes (optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what's on your mind, what happened today, or any specific feelings..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedMood}
          sx={{
            background: selectedMood
              ? moodOptions.find(m => m.value === selectedMood)?.color
              : 'grey.400',
            '&:hover': {
              background: selectedMood
                ? moodOptions.find(m => m.value === selectedMood)?.color
                : 'grey.400',
            },
          }}
        >
          Detect Mood & Get Music
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoodDetectionModal; 