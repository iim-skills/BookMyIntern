import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string; email: string; password: string;
  role: 'student' | 'recruiter' | 'admin';
  emailVerified: boolean; verificationToken: string | null; tokenExpiry: Date | null;
  collegeName?: string;
  graduationYear?: string;
  currentYearOfStudy?: string;
  twoFactorEnabled?: boolean;
  twoFactorCode?: string | null;
  twoFactorExpiry?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  tokenVersion?: number;
  createdAt: Date; updatedAt: Date;
  comparePassword: (plain: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name:              { type: String, required: true, trim: true },
    email:             { type: String, required: true, unique: true, lowercase: true },
    password:          { type: String, required: true },
    role:              { type: String, enum: ['student', 'recruiter', 'admin'], required: true },
    emailVerified:     { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    tokenExpiry:       { type: Date,   default: null },
    collegeName:       { type: String, default: '' },
    graduationYear:    { type: String, default: '' },
    currentYearOfStudy:{ type: String, default: '' },
    twoFactorEnabled:  { type: Boolean, default: false },
    twoFactorCode:     { type: String, default: null },
    twoFactorExpiry:   { type: Date,   default: null },
    resetToken:        { type: String, default: null },
    resetTokenExpiry:  { type: Date,   default: null },
    tokenVersion:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
UserSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

// Bust stale hot-reload cache if 'collegeName' is missing from schema
if (mongoose.models.User) {
  const paths = Object.keys((mongoose.models.User as mongoose.Model<IUserDocument>).schema.paths);
  if (!paths.includes('collegeName') || !paths.includes('twoFactorEnabled')) {
    delete mongoose.models.User;
  }
}

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export default User;
