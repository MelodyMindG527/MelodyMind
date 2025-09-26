import mongoose from 'mongoose';
import { toJSON } from '../db/mongoose.js';

const analyticsEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    type: { type: String, enum: ['mood_song'], required: true },
    moodLabel: { type: String, required: true },
    songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    songTitle: { type: String },
    songArtist: { type: String },
    songGenres: { type: [String], default: [] },
    metadata: {},
  },
  { timestamps: true }
);

analyticsEventSchema.index({ userId: 1, type: 1, createdAt: -1 });
toJSON(analyticsEventSchema);

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);


