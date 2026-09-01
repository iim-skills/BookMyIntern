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
  stipendAmount?: number;
  durationWeeks?: number;
  ppoPossibility?: boolean;
  internCertificate?: boolean;
  views?: number;
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
    stipendAmount: { type: Number, default: 0 },
    durationWeeks: { type: Number, default: 0 },
    ppoPossibility: { type: Boolean, default: false },
    internCertificate: { type: Boolean, default: false },
    views:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Bust stale hot-reload cache if 'stipendAmount' is missing from schema
if (mongoose.models.Job) {
  const paths = Object.keys((mongoose.models.Job as mongoose.Model<IJobDocument>).schema.paths);
  if (!paths.includes('stipendAmount') || !paths.includes('views')) {
    delete mongoose.models.Job;
  }
}

const Job: Model<IJobDocument> =
  mongoose.models.Job || mongoose.model<IJobDocument>('Job', JobSchema);
export default Job;
