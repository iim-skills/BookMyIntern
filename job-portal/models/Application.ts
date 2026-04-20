import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AppStatus =
  | 'pending'
  | 'reviewed'
  | 'interview'
  | 'on-hold'
  | 'selected'
  | 'rejected';

export interface IApplicationDocument extends Document {
  jobId:     Types.ObjectId;
  studentId: Types.ObjectId;
  status:    AppStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    jobId:     { type: Schema.Types.ObjectId, ref: 'Job',  required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type:    String,
      enum:    ['pending', 'reviewed', 'interview', 'on-hold', 'selected', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications at DB level
ApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const Application: Model<IApplicationDocument> =
  mongoose.models.Application ||
  mongoose.model<IApplicationDocument>('Application', ApplicationSchema);
export default Application;
