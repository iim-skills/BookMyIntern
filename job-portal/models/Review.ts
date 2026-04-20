import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IReviewDocument extends Document {
  reviewerId:   Types.ObjectId;
  revieweeId:   Types.ObjectId;
  jobId:        Types.ObjectId | null;
  rating:       1 | 2 | 3 | 4 | 5;
  content:      string;
  reviewerRole: 'student' | 'recruiter';
  createdAt:    Date;
  updatedAt:    Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    reviewerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId:        { type: Schema.Types.ObjectId, ref: 'Job',  default: null },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    content:      { type: String, required: true, trim: true, maxlength: 1000 },
    reviewerRole: { type: String, enum: ['student', 'recruiter'], required: true },
  },
  { timestamps: true }
);

// One review per (reviewer, reviewee, job) — prevents duplicates
ReviewSchema.index({ reviewerId: 1, revieweeId: 1, jobId: 1 }, { unique: true });

const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);
export default Review;
