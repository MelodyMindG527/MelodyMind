import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { issueToken } from '../middleware/auth.js';

const router = express.Router();

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  password: Joi.string().min(6).required(),
});

router.post('/signup', async (req, res, next) => {
  try {
    const { value, error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const exists = await User.findOne({ email: value.email });
    if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(value.password, 10);
    const user = await User.create({ email: value.email, name: value.name, passwordHash });
    const token = issueToken(user.id);
    res.status(201).json({ success: true, token, user: user.toJSON() });
  } catch (e) {
    next(e);
  }
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/login', async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const ok = await user.verifyPassword(value.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = issueToken(user.id);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (e) {
    next(e);
  }
});

export default router;


