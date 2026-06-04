import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user || !user.isVerified) {
      return res.status(401).json({ message: 'Verified account required.' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session.' });
  }
};
