import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCodeHash: String,
    verificationExpiresAt: Date,
    badges: [{ type: String }],
    returnedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    isVerified: this.isVerified,
    badges: this.badges,
    returnedCount: this.returnedCount,
  };
};

export const User = mongoose.model('User', userSchema);
