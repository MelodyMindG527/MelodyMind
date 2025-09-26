import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
  SentimentNeutral,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface MoodIndicatorProps {
  mood: {
    type: string;
    intensity: number;
    confidence?: number;
    source?: string;
    notes?: string;
  };
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  animated?: boolean;
}

const MoodIndicator: React.FC<MoodIndicatorProps> = ({
  mood,
  size = 'medium',
  showDetails = true,
  animated = true,
}) => {
  const theme = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small': return { icon: 20, text: 'body2', chip: 'small' };
      case 'large': return { icon: 40, text: 'h6', chip: 'medium' };
      default: return { icon: 32, text: 'subtitle1', chip: 'small' };
    }
  };

  const { icon, text, chip } = getSize();

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

  const moodColor = getMoodColor(mood.type);

  const MoodContent = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        sx={{
          width: icon * 1.5,
          height: icon * 1.5,
          backgroundColor: moodColor,
          boxShadow: `0 8px 25px ${moodColor}40`,
        }}
      >
        {getMoodIcon(mood.type)}
      </Avatar>
      <Box>
        <Typography
          variant={text as any}
          fontWeight="bold"
          sx={{ color: moodColor }}
        >
          {mood.type.charAt(0).toUpperCase() + mood.type.slice(1)}
        </Typography>
        {showDetails && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip
              label={`${mood.intensity}/10`}
              size={chip as any}
              sx={{
                backgroundColor: `${moodColor}20`,
                color: moodColor,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
            {mood.confidence && (
              <Chip
                label={`${Math.round(mood.confidence * 100)}%`}
                size={chip as any}
                sx={{
                  backgroundColor: `${moodColor}10`,
                  color: moodColor,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${moodColor}10 0%, ${moodColor}05 100%)`,
            border: `1px solid ${moodColor}30`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, ${moodColor}05 0%, transparent 100%)`,
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <MoodContent />
            {mood.notes && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                "{mood.notes}"
              </Typography>
            )}
            {mood.source && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1 }}
              >
                Detected via {mood.source}
              </Typography>
            )}
          </Box>
        </Box>
      </motion.div>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${moodColor}10 0%, ${moodColor}05 100%)`,
        border: `1px solid ${moodColor}30`,
      }}
    >
      <MoodContent />
    </Box>
  );
};

export default MoodIndicator;
