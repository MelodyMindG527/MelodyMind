import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { toJSON } from '../db/mongoose.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    preferences: {
      favoriteGenres: [String],
      moodPreferences: [String],
    },
  },
  { timestamps: true }
);

toJSON(userSchema);

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);


