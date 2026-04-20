import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type JobTypeEnum = 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote';

export interface IJobDocument extends Document {
  recruiterId: Types.ObjectId;
  companyName: string;
  title:       string;
  description: string;
  location:    string;
  jobType:     JobTypeEnum;
  salary:      string;
  skills:      string[];
  deadline:    Date;
  eligibility: string;
  createdAt:   Date;
  updatedAt:   Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true, trim: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location:    { type: String, required: true, trim: true },
    jobType: {
      type:     String,
      enum:     ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      required: true,
    },
    salary:      { type: String, trim: true, default: '' },
    skills:      [{ type: String }],
    deadline:    { type: Date, required: true },
    eligibility: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const Job: Model<IJobDocument> =
  mongoose.models.Job || mongoose.model<IJobDocument>('Job', JobSchema);
export default Job;
