import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, maxlength: 240 },
    audience: { type: String, default: 'all' },
    tone: { type: String, enum: ['info', 'success', 'warning', 'danger'], default: 'info' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

notificationSchema.index({ audience: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
