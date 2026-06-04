import express from 'express';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { actorFromUser } from '../utils/auth.js';
import { createNotification, emitPostEvent } from '../utils/notifications.js';

const router = express.Router();
const DAY = 24 * 60 * 60 * 1000;
const LOST_EXPIRY_DAYS = 14;
const RETURN_EXPIRY_DAYS = 2;

const isSameUser = (actor, user) => actor?.user?.toString() === user._id.toString();

const refreshExpiredPosts = async () => {
  await Post.updateMany(
    { status: 'open', expiresAt: { $lt: new Date() } },
    { $set: { status: 'expired' } }
  );

  await Post.updateMany(
    { status: 'pending_return', 'returnRequest.status': 'pending', 'returnRequest.expiresAt': { $lt: new Date() } },
    {
      $set: {
        status: 'open',
        'returnRequest.status': 'expired',
        'returnRequest.resolvedAt': new Date(),
      },
      $unset: { claimant: '', returnLocation: '' },
    }
  );
};

const buildPostQuery = (req) => {
  const query = {};
  if (['lost', 'found'].includes(req.query.type)) query.type = req.query.type;
  if (['open', 'pending_return', 'returned', 'expired'].includes(req.query.status)) query.status = req.query.status;
  if (req.query.location) query.location = req.query.location;
  if (req.query.q) query.$text = { $search: req.query.q };
  return query;
};

router.get('/', requireAuth, async (req, res) => {
  await refreshExpiredPosts();
  const posts = await Post.find(buildPostQuery(req)).sort({ createdAt: -1 }).limit(100);
  res.json({ posts });
});

router.get('/locations', requireAuth, async (_req, res) => {
  const locations = await Post.distinct('location', { status: { $ne: 'expired' } });
  res.json({ locations: locations.sort() });
});

router.post('/', requireAuth, async (req, res) => {
  const type = String(req.body.type || '');
  const title = String(req.body.title || '').trim();
  const location = String(req.body.location || '').trim();
  const description = String(req.body.description || '').trim();
  const eventDate = req.body.eventDate ? new Date(req.body.eventDate) : undefined;

  if (!['lost', 'found'].includes(type) || title.length < 2 || location.length < 2) {
    return res.status(400).json({ message: 'Type, item name, and location are required.' });
  }

  const actor = actorFromUser(req.user);
  const post = await Post.create({
    type,
    title,
    location,
    description,
    eventDate,
    owner: type === 'lost' ? actor : undefined,
    finder: type === 'found' ? actor : undefined,
    expiresAt: new Date(Date.now() + LOST_EXPIRY_DAYS * DAY),
  });

  await createNotification({
    message: `${type === 'lost' ? 'Lost' : 'Found'} Item Alert: ${title} ${type === 'lost' ? 'lost near' : 'found at'} ${location}`,
    audience: 'all',
    tone: type === 'lost' ? 'danger' : 'success',
  });
  emitPostEvent('post:new', post);
  res.status(201).json({ post });
});

router.post('/:id/found', requireAuth, async (req, res) => {
  const returnLocation = String(req.body.returnLocation || '').trim();
  const post = await Post.findById(req.params.id);

  if (!post || post.type !== 'lost' || post.status !== 'open') {
    return res.status(404).json({ message: 'Open lost post not found.' });
  }

  if (isSameUser(post.owner, req.user)) {
    return res.status(403).json({ message: 'You cannot find your own lost item.' });
  }

  if (returnLocation.length < 2) {
    return res.status(400).json({ message: 'Collection location is required.' });
  }

  const finder = actorFromUser(req.user);
  post.finder = finder;
  post.returnLocation = returnLocation;
  post.status = 'pending_return';
  post.returnRequest = {
    requestedBy: finder,
    requestedTo: post.owner,
    candidate: post.owner,
    location: returnLocation,
    status: 'pending',
    expiresAt: new Date(Date.now() + RETURN_EXPIRY_DAYS * DAY),
  };
  await post.save();

  await createNotification({
    message: `${req.user.name} requested approval to return ${post.title}.`,
    audience: post.owner.email,
    tone: 'warning',
  });
  emitPostEvent('post:updated', post);
  res.json({ post });
});

router.post('/:id/claim', requireAuth, async (req, res) => {
  const collectionLocation = String(req.body.collectionLocation || '').trim();
  const post = await Post.findById(req.params.id);

  if (!post || post.type !== 'found' || post.status !== 'open') {
    return res.status(404).json({ message: 'Open found post not found.' });
  }

  if (isSameUser(post.finder, req.user)) {
    return res.status(403).json({ message: 'You cannot claim an item you posted as found.' });
  }

  if (collectionLocation.length < 2) {
    return res.status(400).json({ message: 'Collection location is required.' });
  }

  const claimant = actorFromUser(req.user);
  post.owner = claimant;
  post.claimant = claimant;
  post.returnLocation = collectionLocation;
  post.status = 'pending_return';
  post.returnRequest = {
    requestedBy: post.finder,
    requestedTo: claimant,
    candidate: claimant,
    location: collectionLocation,
    status: 'pending',
    expiresAt: new Date(Date.now() + RETURN_EXPIRY_DAYS * DAY),
  };
  await post.save();

  await createNotification({
    message: `${post.finder.name} sent a return approval request for ${post.title}.`,
    audience: req.user.email,
    tone: 'warning',
  });
  emitPostEvent('post:updated', post);
  res.json({ post });
});

router.post('/:id/approve', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'pending_return' || post.returnRequest?.status !== 'pending') {
    return res.status(404).json({ message: 'Pending return request not found.' });
  }

  if (!isSameUser(post.returnRequest.requestedTo, req.user)) {
    return res.status(403).json({ message: 'Only the original owner/claimant can approve this return.' });
  }

  post.status = 'returned';
  post.returnedAt = new Date();
  post.returnRequest.status = 'approved';
  post.returnRequest.resolvedAt = new Date();
  await post.save();

  if (post.finder?.user) {
    const finder = await User.findById(post.finder.user);
    if (finder) {
      finder.returnedCount += 1;
      finder.badges = Array.from(
        new Set([
          ...finder.badges,
          'First Item Returned',
          finder.returnedCount >= 3 ? 'Campus Helper' : null,
          finder.returnedCount >= 5 ? 'Trusted Finder' : null,
        ].filter(Boolean))
      );
      await finder.save();
    }
  }

  await createNotification({
    message: `${post.title} marked completed. Owner approval received.`,
    audience: 'all',
    tone: 'success',
  });
  emitPostEvent('post:updated', post);
  res.json({ post });
});

router.post('/:id/reject', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'pending_return' || post.returnRequest?.status !== 'pending') {
    return res.status(404).json({ message: 'Pending return request not found.' });
  }

  if (!isSameUser(post.returnRequest.requestedTo, req.user)) {
    return res.status(403).json({ message: 'Only the original owner/claimant can reject this return.' });
  }

  post.status = 'open';
  post.returnRequest.status = 'rejected';
  post.returnRequest.resolvedAt = new Date();
  post.returnLocation = undefined;
  post.claimant = undefined;
  if (post.type === 'lost') {
    post.finder = undefined;
  } else {
    post.owner = undefined;
  }
  await post.save();

  await createNotification({
    message: `Return request rejected for ${post.title} - wrong person.`,
    audience: 'all',
    tone: 'danger',
  });
  emitPostEvent('post:updated', post);
  res.json({ post });
});

export default router;
