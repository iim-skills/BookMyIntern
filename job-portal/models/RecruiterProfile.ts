import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IRecruiterProfileDocument extends Document {
  userId:      Types.ObjectId;
  firmName:    string;
  firmWebsite: string;
  designation: string;
  phone:       string;
}

const RecruiterProfileSchema = new Schema<IRecruiterProfileDocument>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firmName:    { type: String, required: true, trim: true },
    firmWebsite: { type: String, trim: true, default: '' },
    designation: { type: String, required: true, trim: true },
    phone:       { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const RecruiterProfile: Model<IRecruiterProfileDocument> =
  mongoose.models.RecruiterProfile ||
  mongoose.model<IRecruiterProfileDocument>('RecruiterProfile', RecruiterProfileSchema);
export default RecruiterProfile;
