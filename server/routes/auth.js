import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import { User } from '../models/User.js';
import { isAllowedEmail, signToken } from '../utils/auth.js';
import { sendVerificationEmail } from '../utils/mail.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');
const makeCode = () => String(Math.floor(100000 + Math.random() * 900000));

router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (name.length < 2 || password.length < 8) {
    return res.status(400).json({ message: 'Name and 8+ character password are required.' });
  }

  if (!isAllowedEmail(email)) {
    return res.status(400).json({ message: 'Use a college-authorized email address.' });
  }

  const existing = await User.findOne({ email });
  if (existing?.isVerified) {
    return res.status(409).json({ message: 'Account already exists. Please log in.' });
  }

  const code = makeCode();
  const payload = {
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    verificationCodeHash: hashCode(code),
    verificationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };

  const user = existing
    ? await User.findByIdAndUpdate(existing._id, payload, { new: true })
    : await User.create(payload);

  const delivery = await sendVerificationEmail({ email: user.email, code });
  res.status(201).json({
    message: delivery.delivered
      ? 'Verification code sent to your college email.'
      : 'SMTP is not configured. Use the development verification code.',
    devVerificationCode: delivery.devCode,
  });
});

router.post('/verify', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const code = String(req.body.code || '').trim();
  const user = await User.findOne({ email });

  if (!user || user.verificationCodeHash !== hashCode(code) || user.verificationExpiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired verification code.' });
  }

  user.isVerified = true;
  user.verificationCodeHash = undefined;
  user.verificationExpiresAt = undefined;
  await user.save();

  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Verify your college email before logging in.' });
  }

  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
