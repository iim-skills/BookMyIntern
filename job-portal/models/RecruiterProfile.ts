import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IRecruiterProfileDocument extends Document {
  userId: Types.ObjectId; firmName: string; firmWebsite: string;
  designation: string; phone: string; adminVerified: boolean;
  createdAt: Date; updatedAt: Date;
}

const RecruiterProfileSchema = new Schema<IRecruiterProfileDocument>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firmName:      { type: String, required: true, trim: true },
    firmWebsite:   { type: String, trim: true, default: '' },
    designation:   { type: String, required: true, trim: true },
    phone:         { type: String, required: true, trim: true },
    adminVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Bust stale cache if adminVerified missing
if (mongoose.models.RecruiterProfile) {
  const paths = Object.keys(
    (mongoose.models.RecruiterProfile as mongoose.Model<IRecruiterProfileDocument>).schema.paths
  );
  if (!paths.includes('adminVerified')) delete mongoose.models.RecruiterProfile;
}

const RecruiterProfile: Model<IRecruiterProfileDocument> =
  mongoose.models.RecruiterProfile ||
  mongoose.model<IRecruiterProfileDocument>('RecruiterProfile', RecruiterProfileSchema);
export default RecruiterProfile;
