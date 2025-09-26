import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  CalendarToday,
  Add,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
  SentimentNeutral,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useMusicStore } from '../store/musicStore';

const Journal: React.FC = () => {
  const theme = useTheme();
  const { addMoodToHistory, currentMood } = useMusicStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ date: string; moodLabel: string; intensity: number; notes?: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    mood: '',
    intensity: 5,
    notes: '',
  });

  // Generate calendar days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getMoodForDate = (date: Date) => {
    const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0,10);
    const entry = entries.find(e => new Date(e.date).toISOString().slice(0,10) === key);
    return entry
      ? { type: entry.moodLabel, intensity: entry.intensity, timestamp: new Date(entry.date), source: 'journal', notes: entry.notes }
      : null;
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      // default server behavior already uses last 30 days if not provided
      const res = await fetch('http://localhost:8000/api/v1/journal', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch journal: ${res.status}`);
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map((d: any) => ({
        date: d.date,
        moodLabel: d.moodLabel,
        intensity: d.intensity,
        notes: d.notes,
      }));
      setEntries(mapped);
    } catch (e: any) {
      console.error(e);
      setError('Could not load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const getMoodColor = (moodType: string) => {
    switch (moodType) {
      case 'happy':
      case 'excited':
        return '#4caf50';
      case 'sad':
      case 'melancholic':
        return '#f44336';
      case 'energetic':
        return '#ff9800';
      case 'calm':
      case 'focused':
        return '#2196f3';
      case 'anxious':
        return '#ff5722';
      default:
        return '#9e9e9e';
    }
  };

  const getMoodIcon = (moodType: string) => {
    switch (moodType) {
      case 'happy':
      case 'excited':
        return <SentimentVerySatisfied />;
      case 'sad':
      case 'melancholic':
        return <SentimentVeryDissatisfied />;
      case 'energetic':
        return <SentimentSatisfied />;
      case 'anxious':
        return <SentimentDissatisfied />;
      default:
        return <SentimentNeutral />;
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.mood) return;
    try {
      setLoading(true);
      setError(null);
      const body = {
        date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString(),
        moodLabel: newEntry.mood,
        intensity: newEntry.intensity,
        notes: newEntry.notes,
        tags: [],
      };
      const res = await fetch('http://localhost:8000/api/v1/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to save entry: ${res.status}`);
      const saved = await res.json();
      // Update local entries view
      setEntries((prev) => {
        const withoutSameDay = prev.filter(e => new Date(e.date).toDateString() !== new Date(saved.date).toDateString());
        return [
          { date: saved.date, moodLabel: saved.moodLabel, intensity: saved.intensity, notes: saved.notes },
          ...withoutSameDay,
        ];
      });
      // Also keep local mood history for other parts of the app
      addMoodToHistory({
        id: saved._id || Date.now().toString(),
        type: saved.moodLabel,
        intensity: saved.intensity,
        timestamp: new Date(saved.date),
        source: 'journal',
        notes: saved.notes,
      });
      setNewEntry({ mood: '', intensity: 5, notes: '' });
      setShowAddEntry(false);
    } catch (e: any) {
      console.error(e);
      setError('Could not save entry');
    } finally {
      setLoading(false);
    }
  };

  // Pre-populate with current mood when opening dialog
  const handleOpenAddEntry = () => {
    if (currentMood) {
      setNewEntry({
        mood: currentMood.type,
        intensity: currentMood.intensity,
        notes: currentMood.notes || '',
      });
    } else {
      setNewEntry({ mood: '', intensity: 5, notes: '' });
    }
    setShowAddEntry(true);
  };

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

  const days = getDaysInMonth(selectedDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 6,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -20,
          left: -20,
          right: -20,
          bottom: -20,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          zIndex: 0,
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Mood Journal
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Track your emotions and discover patterns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddEntry}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Add Entry
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </Typography>
                <Box>
                  <Button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    disabled={selectedDate.getMonth() === 0 && selectedDate.getFullYear() === 2024}
                  >
                    ←
                  </Button>
                  <Button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  >
                    →
                  </Button>
                </Box>
              </Box>

              {error && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              {/* Calendar Grid */}
              <Grid container spacing={1}>
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Grid item xs={12/7} key={day}>
                    <Box sx={{ textAlign: 'center', py: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                      {day}
                    </Box>
                  </Grid>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                  const mood = day ? getMoodForDate(day) : null;
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const isSelected = day && day.toDateString() === selectedDate.toDateString();

                  return (
                    <Grid item xs={12/7} key={index}>
                      {day ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Box
                            onClick={() => setSelectedDate(day)}
                            sx={{
                              aspectRatio: '1',
                              border: isToday ? '2px solid' : '1px solid',
                              borderColor: isToday ? 'primary.main' : 'divider',
                              borderRadius: 3,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'primary.light' : mood ? `${getMoodColor(mood.type)}10` : 'transparent',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&::before': mood ? {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(135deg, ${getMoodColor(mood.type)}20 0%, ${getMoodColor(mood.type)}05 100%)`,
                                zIndex: 0,
                              } : {},
                              '&:hover': {
                                backgroundColor: isSelected ? 'primary.light' : mood ? `${getMoodColor(mood.type)}20` : 'grey.50',
                                transform: 'scale(1.05)',
                                boxShadow: mood ? `0 8px 25px ${getMoodColor(mood.type)}30` : '0 4px 12px rgba(0, 0, 0, 0.1)',
                              },
                            }}
                          >
                            <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}>
                              {day.getDate()}
                            </Typography>
                            {mood && (
                              <Box sx={{ color: getMoodColor(mood.type), mt: 0.5 }}>
                                {getMoodIcon(mood.type)}
                              </Box>
                            )}
                          </Box>
                        </motion.div>
                      ) : (
                        <Box sx={{ aspectRatio: '1' }} />
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Date Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>

              {(() => {
                const mood = getMoodForDate(selectedDate);
                return mood ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ backgroundColor: getMoodColor(mood.type) }}>
                        {getMoodIcon(mood.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {mood.type.charAt(0).toUpperCase() + mood.type.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Intensity: {mood.intensity}/10
                        </Typography>
                      </Box>
                    </Box>
                    
                    {mood.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        "{mood.notes}"
                      </Typography>
                    )}
                    
                    <Chip
                      label={`Detected via ${mood.source}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarToday sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No mood entry for this date
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={handleOpenAddEntry}
                      startIcon={<Add />}
                    >
                      Add Entry
                    </Button>
                  </Box>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Entry Dialog */}
      <Dialog
        open={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Add Mood Entry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
          {currentMood && (
            <Chip
              label={`Pre-filled with detected mood: ${currentMood.type.charAt(0).toUpperCase() + currentMood.type.slice(1)}`}
              size="small"
              sx={{ 
                mt: 1, 
                backgroundColor: getMoodColor(currentMood.type),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              How were you feeling?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {moodOptions.map((mood) => (
                <Chip
                  key={mood.value}
                  label={mood.label}
                  onClick={() => setNewEntry(prev => ({ ...prev, mood: mood.value }))}
                  sx={{
                    backgroundColor: newEntry.mood === mood.value ? mood.color : 'grey.100',
                    color: newEntry.mood === mood.value ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: newEntry.mood === mood.value ? mood.color : 'grey.200',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Intensity: {newEntry.intensity}/10
            </Typography>
            <Slider
              value={newEntry.intensity}
              onChange={(_, value) => setNewEntry(prev => ({ ...prev, intensity: value as number }))}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={3}
            value={newEntry.notes}
            onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Describe your day, what happened, or any specific feelings..."
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowAddEntry(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddEntry}
            variant="contained"
            disabled={!newEntry.mood || loading}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Journal; 