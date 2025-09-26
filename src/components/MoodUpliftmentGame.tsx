import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Close, EmojiEmotions, MusicNote, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface MoodUpliftmentGameProps {
  open: boolean;
  onClose: () => void;
}

const MoodUpliftmentGame: React.FC<MoodUpliftmentGameProps> = ({
  open,
  onClose,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentNote, setCurrentNote] = useState<{ x: number; y: number; id: number } | null>(null);
  const [notes, setNotes] = useState<Array<{ x: number; y: number; id: number; clicked: boolean }>>([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (open) {
      setGameState('intro');
      setScore(0);
      setTimeLeft(30);
      setNotes([]);
      setGameStarted(false);
    }
  }, [open]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('completed');
    }

    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  useEffect(() => {
    let noteTimer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      noteTimer = setTimeout(() => {
        generateNewNote();
      }, 1500);
    }

    return () => clearTimeout(noteTimer);
  }, [gameState, timeLeft, notes]);

  const generateNewNote = () => {
    const newNote = {
      x: Math.random() * 80 + 10, // 10% to 90% of container width
      y: Math.random() * 60 + 20, // 20% to 80% of container height
      id: Date.now(),
      clicked: false,
    };
    setNotes(prev => [...prev, newNote]);
  };

  const startGame = () => {
    setGameState('playing');
    setGameStarted(true);
    generateNewNote();
  };

  const handleNoteClick = (noteId: number) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === noteId ? { ...note, clicked: true } : note
      )
    );
    setScore(prev => prev + 10);
    
    // Remove clicked note after animation
    setTimeout(() => {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }, 300);
  };

  const getGameMessage = () => {
    if (score >= 100) return "Amazing! You're a music maestro! 🎵";
    if (score >= 70) return "Great job! You've got rhythm! 🎶";
    if (score >= 40) return "Good effort! Keep the beat going! 🥁";
    return "Nice try! Music is all about practice! 🎼";
  };

  const getEncouragementMessage = () => {
    const messages = [
      "Remember, every note you catch brings you closer to a better mood!",
      "Music has the power to transform your feelings.",
      "You're doing great! Keep focusing on the positive notes.",
      "Each successful catch is a step toward feeling better.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEmotions sx={{ color: '#ff9800' }} />
          <Typography variant="h5" fontWeight="bold">
            Mood Upliftment Game
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Catch the musical notes to boost your mood!
        </Typography>
      </DialogTitle>

      <DialogContent>
        {gameState === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3, backgroundColor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎵 Tap the Notes Game
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Musical notes will appear on the screen. Tap them quickly to score points!
                  This simple game can help shift your focus and improve your mood.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="30 seconds" size="small" />
                  <Chip label="Tap notes" size="small" />
                  <Chip label="Score points" size="small" />
                </Box>
              </CardContent>
            </Card>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {getEncouragementMessage()}
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={startGame}
              sx={{
                background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00, #ff9800)',
                },
              }}
            >
              Start Game
            </Button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <Box>
            {/* Game Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Score: {score}
              </Typography>
              <Typography variant="h6" color={timeLeft <= 10 ? 'error' : 'text.primary'}>
                Time: {timeLeft}s
              </Typography>
            </Box>

            {/* Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={(timeLeft / 30) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: timeLeft <= 10 ? '#f44336' : '#4caf50',
                },
              }}
            />

            {/* Game Area */}
            <Box
              sx={{
                position: 'relative',
                height: 400,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300',
                overflow: 'hidden',
              }}
            >
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: note.clicked ? 1.5 : 1,
                    opacity: note.clicked ? 0 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    left: `${note.x}%`,
                    top: `${note.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                  }}
                  onClick={() => !note.clicked && handleNoteClick(note.id)}
                >
                  <MusicNote
                    sx={{
                      fontSize: 40,
                      color: note.clicked ? '#4caf50' : '#ff9800',
                      filter: note.clicked ? 'drop-shadow(0 0 10px #4caf50)' : 'none',
                    }}
                  />
                </motion.div>
              ))}

              {notes.length === 0 && gameStarted && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Waiting for notes...
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {gameState === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ textAlign: 'center', p: 4, backgroundColor: '#e8f5e8' }}>
              <Box sx={{ mb: 3 }}>
                <Star sx={{ fontSize: 60, color: '#ffd700', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Game Complete!
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  Final Score: {score}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {getGameMessage()}
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Great job! Playing games can help distract from negative thoughts and boost your mood.
                Remember, it's okay to not feel okay, and small activities like this can make a difference.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setGameState('intro');
                    setScore(0);
                    setTimeLeft(30);
                    setNotes([]);
                    setGameStarted(false);
                  }}
                >
                  Play Again
                </Button>
                <Button
                  variant="contained"
                  onClick={onClose}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #388e3c, #4caf50)',
                    },
                  }}
                >
                  Continue to Music
                </Button>
              </Box>
            </Card>
          </motion.div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {gameState === 'playing' && (
          <Button
            onClick={() => {
              setGameState('completed');
              setTimeLeft(0);
            }}
            variant="outlined"
          >
            End Game
          </Button>
        )}
        <Button onClick={onClose} variant="outlined" startIcon={<Close />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoodUpliftmentGame; 