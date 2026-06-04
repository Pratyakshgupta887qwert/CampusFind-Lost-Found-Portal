import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Post } from '../models/Post.js';

const router = express.Router();

router.get('/', requireAuth, async (_req, res) => {
  const [lost, found, returned, pending, helpers] = await Promise.all([
    Post.countDocuments({ type: 'lost' }),
    Post.countDocuments({ type: 'found' }),
    Post.countDocuments({ status: 'returned' }),
    Post.countDocuments({ status: 'pending_return' }),
    Post.aggregate([
      { $match: { status: 'returned', 'finder.email': { $exists: true } } },
      { $group: { _id: '$finder.email', name: { $first: '$finder.name' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.json({
    analytics: {
      lost,
      found,
      returned,
      pending,
      successRate: lost ? Math.round((returned / lost) * 100) : 0,
      topHelpers: helpers.map((helper) => ({
        name: helper.name,
        email: helper._id,
        count: helper.count,
      })),
    },
  });
});

export default router;
