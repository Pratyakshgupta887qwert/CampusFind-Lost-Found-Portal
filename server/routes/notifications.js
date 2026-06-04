import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ audience: 'all' }, { audience: req.user.email }],
  })
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({ notifications });
});

router.patch('/read', requireAuth, async (req, res) => {
  await Notification.updateMany(
    { $or: [{ audience: 'all' }, { audience: req.user.email }], readBy: { $ne: req.user._id } },
    { $push: { readBy: req.user._id } }
  );
  res.json({ ok: true });
});

export default router;
