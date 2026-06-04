import mongoose from 'mongoose';

const actorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
  },
  { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
  {
    requestedBy: actorSchema,
    requestedTo: actorSchema,
    candidate: actorSchema,
    location: { type: String, required: true, trim: true, maxlength: 160 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
    },
    expiresAt: Date,
    resolvedAt: Date,
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    eventDate: Date,
    description: { type: String, trim: true, maxlength: 800 },
    owner: actorSchema,
    finder: actorSchema,
    claimant: actorSchema,
    returnLocation: String,
    status: {
      type: String,
      enum: ['open', 'pending_return', 'returned', 'expired'],
      default: 'open',
    },
    expiresAt: { type: Date, required: true },
    returnedAt: Date,
    returnRequest: returnRequestSchema,
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', location: 'text', description: 'text' });
postSchema.index({ status: 1, type: 1, createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);
