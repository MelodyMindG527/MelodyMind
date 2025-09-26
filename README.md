# MelodyMind - AI-Powered Mood-Based Music Platform

MelodyMind is a full-stack application that uses AI to detect your mood and recommend personalized music playlists. The platform features multiple mood detection methods, interactive games, mood tracking, and comprehensive analytics.

## 🏗️ Project Architecture

```
melodymind/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # API utilities
│   ├── package.json
│   └── README.md
├── project1/
│   └── server/              # Node.js + Express backend
│       ├── src/
│       │   ├── config/     # Environment configuration
│       │   ├── db/         # Database connection
│       │   ├── middleware/ # Authentication & error handling
│       │   ├── models/     # MongoDB schemas
│       │   ├── routes/     # API endpoints
│       │   └── services/   # AI & music services
│       ├── music/          # Sample audio files
│       ├── package.json
│       └── README.md
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   └── Configuration.md       # Environment setup
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm or yarn

### 1. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

### 2. Backend Setup
```bash
cd project1/server
cp env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```
Backend runs on `http://localhost:8000`

### 3. Environment Configuration
Create environment files for different stages:

**Frontend** (`frontend/.env.staging`):
```
REACT_APP_API_BASE=https://staging.api.melodymind.com
REACT_APP_ENV=staging
```

**Frontend** (`frontend/.env.production`):
```
REACT_APP_API_BASE=https://api.melodymind.com
REACT_APP_ENV=production
```

**Backend** (`project1/server/.env`):
```
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/melodymind
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
```

## 🎵 Features

### Core Features
- **Multi-Modal Mood Detection**
  - Camera-based facial expression analysis
  - Text-based mood input with intensity slider
  - Voice tone analysis and commands
  - Manual journal entries

- **AI-Powered Music Recommendations**
  - Personalized playlists based on detected mood
  - Mood-music correlation analytics
  - Smart song suggestions

- **Interactive Mood Upliftment Games**
  - Tap the Notes game for mood improvement
  - Breathing exercises, mood quizzes, gratitude journal

- **Comprehensive Mood Tracking**
  - Interactive calendar with mood visualization
  - Daily mood entries with notes
  - Mood history and patterns

- **Advanced Analytics**
  - Mood frequency and intensity charts
  - Weekly mood trends
  - Music genre preferences by mood
  - Personal insights and statistics

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **UI Library**: Material UI (MUI)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Webcam**: React Webcam
- **Styling**: Emotion (CSS-in-JS)

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **File Storage**: GridFS for audio files
- **Security**: Helmet, CORS
- **Validation**: Joi
- **AI Integration**: Pluggable AI services

## 📡 API Documentation

### Base URL
- Development: `http://localhost:8000/api/v1`
- Staging: `https://staging.api.melodymind.com/api/v1`
- Production: `https://api.melodymind.com/api/v1`

### Core Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

#### Mood Detection
- `POST /mood/image` - Upload image for mood analysis
- `POST /mood/text` - Submit text for mood analysis
- `POST /mood/audio` - Upload audio for mood analysis
- `GET /mood/history` - Get user's mood history

#### Music & Playlists
- `POST /songs/upload` - Upload audio files
- `GET /songs` - Get available songs
- `GET /songs/stream/:id` - Stream audio file
- `GET /recommendations?mood=calm` - Get mood-based recommendations
- `POST /playlists` - Create playlist
- `GET /playlists/:id` - Get playlist details
- `POST /playlists/generate` - AI-generated playlists

#### Journal & Analytics
- `POST /journal` - Create journal entry
- `GET /journal` - Get journal entries
- `GET /journal/month/:year/:month` - Monthly journal data
- `GET /analytics/summary` - Analytics overview
- `GET /analytics/trends?days=30` - Trend analysis

#### Games
- `POST /games/record` - Record game session
- `GET /games/user/me` - Get user's game data
- `GET /games/stats` - Game statistics

## 🔧 Development Scripts

### Frontend
```bash
npm start                # Development server
npm run start:staging    # Staging environment
npm run start:production # Production environment
npm run build            # Production build
npm run build:staging    # Staging build
npm run build:production # Production build
```

### Backend
```bash
npm run dev              # Development with nodemon
npm start                # Production server
npm run lint             # Code linting
```

## 🌍 Environment Configuration

### Frontend Environment Variables
- `REACT_APP_API_BASE` - Backend API base URL
- `REACT_APP_ENV` - Environment name (development/staging/production)

### Backend Environment Variables
- `PORT` - Server port (default: 8000)
- `NODE_ENV` - Environment (development/staging/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration time
- `CLIENT_ORIGIN` - Allowed CORS origin
- `MAX_FILE_SIZE_MB` - Maximum file upload size

## 📱 Mobile & Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets and gesture support
- **Responsive Layout**: Works on all screen sizes
- **Offline Support**: Local storage for core functionality

## 🔒 Security Features

- **Authentication**: JWT-based authentication
- **Authorization**: Protected routes with middleware
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **File Validation**: Secure file upload handling
- **Input Validation**: Joi schema validation

## 🚀 Deployment

### Frontend Deployment
1. Set environment variables for target environment
2. Run appropriate build command:
   ```bash
   npm run build:staging    # For staging
   npm run build:production # For production
   ```
3. Deploy build folder to your hosting service

### Backend Deployment
1. Set production environment variables
2. Install dependencies: `npm install --production`
3. Start server: `npm start`
4. Ensure MongoDB is accessible
5. Configure reverse proxy (nginx/Apache)

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile data
- **MoodDetection**: Mood analysis results
- **JournalEntry**: Daily mood journal entries
- **Playlist**: User-created playlists
- **Song**: Audio file metadata
- **GameSession**: Game interaction data
- **AnalyticsEvent**: User behavior tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@melodymind.com or create an issue in the repository.

## 🔮 Future Features

- **Real AI Integration**: Connect to actual mood detection APIs
- **Music Streaming**: Integration with Spotify, Apple Music, etc.
- **Social Features**: Share playlists and mood insights
- **Advanced Games**: More interactive mood improvement activities
- **Voice Assistant**: Full conversational AI integration
- **Dark Mode**: Complete dark theme implementation

---

**MelodyMind** - Your AI-powered mood-based music companion 🎵✨

## 📚 Additional Documentation

- [Frontend README](frontend/README.md) - Detailed frontend documentation
- [Backend README](project1/server/README.md) - Backend API documentation
- [Configuration Guide](docs/Configuration.md) - Environment setup
- [API Documentation](docs/API.md) - Complete API reference
