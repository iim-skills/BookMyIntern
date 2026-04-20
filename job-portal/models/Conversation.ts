import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IConversationDocument extends Document {
  participants:       Types.ObjectId[];
  jobId:              Types.ObjectId | null;
  lastMessagePreview: string;
  lastMessageAt:      Date;
  createdAt:          Date;
  updatedAt:          Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    // Always exactly 2 participants: one student + one recruiter
    participants:       [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    jobId:              { type: Schema.Types.ObjectId, ref: 'Job', default: null },
    lastMessagePreview: { type: String, default: '' },
    lastMessageAt:      { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One conversation per (student, recruiter, job) tuple
ConversationSchema.index({ participants: 1, jobId: 1 });

const Conversation: Model<IConversationDocument> =
  mongoose.models.Conversation ||
  mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
export default Conversation;
