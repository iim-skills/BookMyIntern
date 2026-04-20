import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMessageDocument extends Document {
  conversationId: Types.ObjectId;
  senderId:       Types.ObjectId;
  content:        string;
  readBy:         Types.ObjectId[];
  createdAt:      Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId:       { type: Schema.Types.ObjectId, ref: 'User',         required: true },
    content:        { type: String, required: true, trim: true, maxlength: 2000 },
    readBy:         [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

const Message: Model<IMessageDocument> =
  mongoose.models.Message || mongoose.model<IMessageDocument>('Message', MessageSchema);
export default Message;
