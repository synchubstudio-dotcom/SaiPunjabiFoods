import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IAddress, UserRole } from '@sai-punjabi/shared';

export interface IUserDocument extends Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>, Document {
  passwordHash: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: 'Home' },
    street: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Hidden by default from queries
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [AddressSchema],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
