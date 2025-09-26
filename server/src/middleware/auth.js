import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (_e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function issueToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN });
}


