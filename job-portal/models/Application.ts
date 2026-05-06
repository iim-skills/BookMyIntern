import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AppStatus =
  | 'pending'
  | 'reviewed'
  | 'interview'
  | 'on-hold'
  | 'selected'
  | 'rejected';

export interface IApplicationDocument extends Document {
  jobId:             Types.ObjectId;
  studentId:         Types.ObjectId;
  status:            AppStatus;
  phone:             string;
  yearsOfExperience: string;
  education:         string;
  applicantSkills:   string;
  coverLetter:       string;
  resumePath:        string;
  resumeFilename:    string;
  createdAt:         Date;
  updatedAt:         Date;
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
    phone:             { type: String, default: '' },
    yearsOfExperience: { type: String, default: '' },
    education:         { type: String, default: '' },
    applicantSkills:   { type: String, default: '' },
    coverLetter:       { type: String, default: '' },
    resumePath:        { type: String, default: '' },
    resumeFilename:    { type: String, default: '' },
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

// ── FIX: bust the Mongoose model cache when the schema has changed ───────────
//
// In Next.js dev (hot-reload), module code re-runs but global state persists.
// If an older compile of Application.ts was cached WITHOUT resumePath /
// resumeFilename, mongoose.models.Application is the stale compiled model.
// Mongoose strict mode then silently drops those fields on every .create()
// call — the file saves to disk but the path is never written to MongoDB.
//
// Solution: inspect the cached model's schema. If resumePath is missing,
// delete the stale entry so Mongoose re-compiles from the current schema.
// This is a no-op in production (no cached model on cold start).
// ────────────────────────────────────────────────────────────────────────────
if (mongoose.models.Application) {
  const cachedPaths = Object.keys(
    (mongoose.models.Application as mongoose.Model<IApplicationDocument>).schema.paths
  );
  if (!cachedPaths.includes('resumePath')) {
    // Schema is outdated — delete so we re-register below
    delete mongoose.models.Application;
  }
}

const Application: Model<IApplicationDocument> =
  mongoose.models.Application ||
  mongoose.model<IApplicationDocument>('Application', ApplicationSchema);

export default Application;
