import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
  SentimentNeutral,
  TrendingUp,
  MusicNote,
} from '@mui/icons-material';
import { useMusicStore } from '../store/musicStore';
import { apiFetch } from '../utils/api';

const Analytics: React.FC = () => {
  const theme = useTheme();
  const { moodHistory, playlists, currentMood } = useMusicStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sRes, tRes] = await Promise.all([
          apiFetch('/api/v1/analytics/summary'),
          apiFetch('/api/v1/analytics/trends?days=30'),
        ]);
        if (!sRes.ok) throw new Error('Failed to load analytics summary');
        if (!tRes.ok) throw new Error('Failed to load analytics trends');
        const s = await sRes.json();
        const t = await tRes.json();
        setSummary(s);
        setTrends(Array.isArray(t) ? t : []);
      } catch (e: any) {
        console.error(e);
        setError('Could not load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Track mood-to-song events when songs are played
  const trackMoodSongEvent = async (mood: string, song: any) => {
    try {
      await apiFetch('/api/v1/analytics/events/mood-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodLabel: mood, song }),
      });
    } catch (error) {
      console.error('Failed to track mood-song event:', error);
    }
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    const moodCounts: { [key: string]: number } = {};
    const moodIntensities: { [key: string]: number[] } = {};
    
    moodHistory.forEach(mood => {
      moodCounts[mood.type] = (moodCounts[mood.type] || 0) + 1;
      if (!moodIntensities[mood.type]) {
        moodIntensities[mood.type] = [];
      }
      moodIntensities[mood.type].push(mood.intensity);
    });

    const averageIntensities: { [key: string]: number } = {};
    Object.keys(moodIntensities).forEach(mood => {
      const avg = moodIntensities[mood].reduce((a, b) => a + b, 0) / moodIntensities[mood].length;
      averageIntensities[mood] = Math.round(avg * 10) / 10;
    });

    return { moodCounts, averageIntensities };
  };

  const { moodCounts, averageIntensities } = getMoodStats();

  // Prepare data for charts
  const moodFrequencyData = Object.keys(moodCounts).map(mood => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count: moodCounts[mood],
    color: getMoodColor(mood),
  }));

  const moodIntensityData = Object.keys(averageIntensities).map(mood => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    intensity: averageIntensities[mood],
    color: getMoodColor(mood),
  }));

  // Weekly mood trend (last 7 days)
  const getWeeklyTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayMoods = moodHistory.filter(mood => 
        new Date(mood.timestamp).toDateString() === date.toDateString()
      );
      
      const avgIntensity = dayMoods.length > 0 
        ? dayMoods.reduce((sum, mood) => sum + mood.intensity, 0) / dayMoods.length
        : 0;

      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        intensity: Math.round(avgIntensity * 10) / 10,
        count: dayMoods.length,
      });
    }
    return last7Days;
  };

  const weeklyTrendData = useMemo(() => {
    if (trends.length > 0) {
      return trends.map((x) => ({ day: x.date, intensity: x.avg_intensity, count: x.total_entries }));
    }
    return getWeeklyTrend();
  }, [trends]);

  // Music genre preferences by mood
  const getGenrePreferences = () => {
    const genreByMood: { [key: string]: { [key: string]: number } } = {};
    
    playlists.forEach(playlist => {
      if (!genreByMood[playlist.mood]) {
        genreByMood[playlist.mood] = {};
      }
      
      playlist.songs.forEach(song => {
        genreByMood[playlist.mood][song.genre] = (genreByMood[playlist.mood][song.genre] || 0) + 1;
      });
    });

    return genreByMood;
  };

  const genrePreferences = getGenrePreferences();

  function getMoodColor(moodType: string) {
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
  }

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Loading analytics...
          </Typography>
          <Box sx={{ width: 20, height: 20, border: '2px solid #f3f3f3', borderTop: '2px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </Box>
      )}
      {error && (
        <Box sx={{ p: 2, backgroundColor: 'error.light', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 6,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          left: -50,
          right: -50,
          bottom: -50,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          zIndex: 0,
        }
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          fontWeight="bold" 
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            position: 'relative',
            zIndex: 1,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          Mood Analytics
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            position: 'relative',
            zIndex: 1,
            fontWeight: 400,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
          }}
        >
          Track your emotional patterns and discover insights about your mood-music relationship
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
            background: 'linear-gradient(135deg, #6366f1 0%, #764ba2 100%)',
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

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)',
              zIndex: 0,
            },
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  backgroundColor: 'primary.main',
                  width: 56,
                  height: 56,
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
                    {moodHistory.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Total Entries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: 'success.main' }}>
                  <SentimentVerySatisfied />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Object.keys(moodCounts).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mood Types
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: 'info.main' }}>
                  <MusicNote />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {playlists.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Playlists Created
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: 'warning.main' }}>
                  <SentimentSatisfied />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {moodHistory.length > 0 
                      ? Math.round(moodHistory.reduce((sum, mood) => sum + mood.intensity, 0) / moodHistory.length * 10) / 10
                      : 0
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Intensity
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Frequency Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mood Frequency
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moodFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mood" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Intensity Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Mood Intensity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moodIntensityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mood" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="intensity" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Mood Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mood Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodFrequencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ mood, percent }) => `${mood} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {moodFrequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Common Moods */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Common Moods
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {moodFrequencyData
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((mood, index) => (
                    <Box key={mood.mood} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ backgroundColor: mood.color }}>
                        {getMoodIcon(mood.mood.toLowerCase())}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {mood.mood}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mood.count} entries
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${Math.round((mood.count / moodHistory.length) * 100)}%`}
                        size="small"
                        sx={{ backgroundColor: mood.color, color: 'white' }}
                      />
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood to Song Correlation */}
        {summary?.moodSongCorrelation && summary.moodSongCorrelation.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mood to Song Plays Correlation
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.moodSongCorrelation.map((x: any) => ({ mood: x._id, plays: x.plays }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="plays" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Current Mood Insights */}
        {currentMood && (
          <Grid item xs={12}>
            <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎵 Current Mood Insights
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                    Confidence: {Math.round((currentMood.confidence || 0.8) * 100)}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  This mood was detected via {currentMood.source} and has been integrated into your analytics.
                  {currentMood.notes && ` Notes: "${currentMood.notes}"`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Music Genre Preferences */}
        {Object.keys(genrePreferences).length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Music Genre Preferences by Mood
                </Typography>
                <Grid container spacing={2}>
                  {Object.keys(genrePreferences).map(mood => (
                    <Grid item xs={12} sm={6} md={4} key={mood}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(genrePreferences[mood])
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 3)
                              .map(([genre, count]) => (
                                <Chip
                                  key={genre}
                                  label={`${genre} (${count})`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Analytics; 